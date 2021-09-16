import { ComputedRef, onUnmounted } from "vue"
import { event } from '@/utils/event'

import {
  IBaseConfigBlocks,
  IBaseConfigData,
  IButtonFunState,
  IExecute,
  IRegisterOption,
  EButtonFun
} from "@/modules/InterEditor"

export function useCommand(
  focusData: ComputedRef<{ focus: IBaseConfigBlocks[], unfocused: IBaseConfigBlocks[] }>,
  data: { value: IBaseConfigData }
) {

  const state: IButtonFunState = {
    current: -1, // 前进后退的索引值
    queue: [], //  存放所有的操作命令
    commands: {} as IExecute, // 制作命令和执行功能一个映射表  undo : ()=>{}  redo:()=>{}
    commandArray: [], // 存放所有的命令
    destroyArray: []
  }

  const registry = (option: IRegisterOption) => {
    state.commandArray.push(option)

    state.commands[option.name] = (...args) => {
      const { redo, undo } = option.execute(...args)

      redo()

      if (!option.pushQueue) { // 不需要放到队列中直接跳过即可
        return
      }

      let { queue, current } = state

      // 如果先放了 组件1 => 组件2 => 组件3 => 组件4 => 组件3
      // 组件1 -> 组件3
      if (queue.length > 0) {
        queue = queue.slice(0, current + 1)
        state.queue = queue
      }

      queue.push({ redo, undo } as IExecute) // 保存指令的前进后退
      state.current = current + 1
      console.log('1', queue)
    }
  }

  // 注册指令
  registry({
    name: EButtonFun.Redo,
    keyboard: 'ctrl+y',
    execute() {
      return {
        redo() {
          let item = state.queue[state.current + 1] // 找到当前的下一步还原操作
          // console.log(state.queue);

          if (item) {
            item.redo && item.redo()
            state.current++
          }
        }
      } as IExecute
    }
  })

  registry({
    name: EButtonFun.Undo,
    keyboard: 'ctrl+z',
    execute() {
      return {
        redo() {
          if (state.current == -1) { // 没有可以撤销的了
            return
          }
          let item = state.queue[state.current] // 找到上一步还原
          if (item) {
            item.undo && item.undo() // 这里没有操作队列
            state.current--
          }
        }
      } as IExecute
    }
  })

  registry({
    name: EButtonFun.Drag,
    pushQueue: true,
    init() {
      this.before = null

      const start = () => {
        this.before = JSON.parse(JSON.stringify(data.value.blocks)) // 深拷贝一下，防止内存篡位
      }

      const end = () => {
        state.commands.drag()
      }

      event.on('start', start)
      event.on('end', end)

      return () => {
        event.off('start', start)
        event.off('end', end)
      }
    },
    execute() {
      let before = this.before
      let after = data.value.blocks
      return {
        redo() {
          data.value = { ...data.value, blocks: after }
        },

        undo() {
          data.value = { ...data.value, blocks: before }
        }
      } as IExecute
    }
  })

  registry({
    name: EButtonFun.UpdateContainer,
    pushQueue: true,
    execute(newValue: any) {
      let state = {
        before: data.value,
        after: newValue
      }

      return {
        redo: () => {
          data.value = state.after
        },
        undo: () => {
          data.value = state.before
        }
      } as IExecute
    }
  })

  registry({
    name: EButtonFun.UpdateBlock,
    pushQueue: true,
    execute({ newBlock, oldBlock }) {
      let state = {
        before: data.value.blocks,

        after: (() => {
          let block = [...data.value.blocks]

          const index = block.indexOf(oldBlock)

          if (index > -1) {
            block.splice(index, 1, newBlock)
          }

          return block
        })()

      }

      return {
        redo: () => {
          data.value = { ...data.value, blocks: state.after }
        },

        undo: () => {
          data.value = { ...data.value, blocks: state.before }
        }
      } as IExecute
    }
  })

  registry({
    name: EButtonFun.PlaceTop,
    pushQueue: true,
    execute() {
      let before = JSON.parse(JSON.stringify(data.value.blocks))

      let after = (() => {
        let { focus, unfocused } = focusData.value
        let maxZIndex = unfocused.reduce((prev, block) => {
          return Math.max(prev, block.zIndex)
        }, -Infinity)

        focus.forEach(block => block.zIndex = maxZIndex + 1)

        return data.value.blocks
      })()

      return {
        undo: () => {
          // 如果当前blocks 前后一致 则不会更新
          data.value = { ...data.value, blocks: before }
        },
        redo: () => {
          data.value = { ...data.value, blocks: after }
        }
      } as IExecute
    }
  })

  registry({
    name: EButtonFun.PlaceBottom,
    pushQueue: true,
    execute() {
      let before = JSON.parse(JSON.stringify(data.value.blocks))
      let after = (() => { // 置顶就是在所有的block中找到最大的
        let { focus, unfocused } = focusData.value
        let minZIndex = unfocused.reduce((prev, block) => {
          return Math.min(prev, block.zIndex)
        }, Infinity) - 1

        // 不能直接 - 1 因为index 不能出现负值 负值就看不到组件了
        if (minZIndex < 0) { // 这里如果是赋值则让没选中的向上 ，自己变成0
          const dur = Math.abs(minZIndex)
          minZIndex = 0
          unfocused.forEach(block => block.zIndex += dur)
        }

        // 让当前选中的比最大的+1 即可
        focus.forEach(block => block.zIndex = minZIndex); // 控制选中的值
        return data.value.blocks
      })()

      return {
        undo: () => {
          // 如果当前blocks 前后一致 则不会更新
          data.value = { ...data.value, blocks: before }
        },
        redo: () => {
          data.value = { ...data.value, blocks: after }
        }
      } as IExecute
    }
  })
  registry({
    name: EButtonFun.Delete, // 删除
    pushQueue: true,
    execute() {
      let state = {
        before: JSON.parse(JSON.stringify(data.value.blocks)), // 当前的值
        after: focusData.value.unfocused // 选中的都删除了 留下的都是没选中的
      }
      return {
        redo: () => {
          data.value = { ...data.value, blocks: state.after }
        },
        undo: () => {
          data.value = { ...data.value, blocks: state.before }
        }
      } as IExecute
    }
  })

  const keyboardEvent = () => {
    const keyCodes: { [key: string]: any } = {
      90: 'z',
      89: 'y'
    }

    const onKeydown = (e: KeyboardEvent) => {
      const { ctrlKey, keyCode } = e

      let keyString: string[] = []

      if (ctrlKey) {
        keyString.push('ctrl')
      }

      keyString.push(keyCodes[keyCode as (number | string)])
      keyString = keyString.join('+') as any as []

      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) {
          return
        }

        if (keyboard === keyString as any as string) {
          state.commands[name]()
          e.preventDefault()
        }
      })
    }

    const init = () => {
      window.addEventListener('keydown', onKeydown)

      return () => {

        window.removeEventListener('keydown', onKeydown)
      }
    }

    return init
  }

  (() => {
    // 监听键盘事件
    state.destroyArray.push(keyboardEvent())
    state.commandArray.forEach(command => command.init && state.destroyArray.push(command.init()))
  })()

  onUnmounted(() => { // 清理绑定的事件
    state.destroyArray.forEach(fn => fn && fn())
  })

  return state

}