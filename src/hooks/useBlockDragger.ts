import { event } from '../utils/event'
import { reactive } from "vue"

import {
  IBaseConfigBlocks,
  IBaseConfigData,
  IDragState,
  ILines
} from '@/modules/InterEditor'
import { ComputedRef } from "@vue/runtime-core"

export function useBlockDragger(
  focusData: ComputedRef<{ focus: IBaseConfigBlocks[], unfocused: IBaseConfigBlocks[] }>,
  lastSelectBlock: ComputedRef<IBaseConfigBlocks>,
  data: ComputedRef<IBaseConfigData>
) {

  let dragState: IDragState = {
    startX: 0,
    startY: 0,
    dragging: false // 默认不是正在拖拽
  }

  let markLine = reactive({
    x: null,
    y: null
  })

  const mousedown = (e: MouseEvent) => {
    let { width: BWidth, height: BHeight } = lastSelectBlock.value

    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: lastSelectBlock.value.left,
      startTop: lastSelectBlock.value.top,
      dragging: false,
      startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
      lines: (() => {
        const { unfocused } = focusData.value

        let lines: ILines = {
          x: [],
          y: []
        }

          ;[
            ...unfocused,
            {
              top: 0,
              left: 0,
              width: data.value.container.width,
              height: data.value.container.height
            }
          ].forEach(c => {
            const { top: ATop, left: ALeft, width, height } = c

            let AHeight = height as number
            let AWidth = width as number
            BHeight = BHeight as number
            BWidth = BWidth as number

            // 当此元素拖拽到和A元素top一致的时候，要显示这根辅助线，辅助线的位置就是ATop
            lines.y.push({ showTop: ATop, top: ATop })
            lines.y.push({ showTop: ATop, top: ATop - BHeight }) // 顶对底
            lines.y.push({ showTop: ATop + AHeight / 2, top: ATop + AHeight / 2 - BHeight / 2 }) // 中对中
            lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight }) // 底对顶
            lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight - BHeight }) // 底对底

            lines.x.push({ showLeft: ALeft, left: ALeft }) // 左对左边
            lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth }) // 右边对左边
            lines.x.push({ showLeft: ALeft + AWidth / 2, left: ALeft + AWidth / 2 - BWidth / 2 })
            lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth - BWidth })
            lines.x.push({ showLeft: ALeft, left: ALeft - BWidth }) // 左对右
          })
        return lines

      })()
    }

    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', mouseup)
  }

  const mousemove = (e: MouseEvent) => {
    let { clientX: moveX, clientY: moveY } = e

    if (!dragState.dragging) {
      dragState.dragging = true
      event.emit('start') // 触发事件，记住默认位置
    }

    // 鼠标移动后 - 鼠标移动前 + left, 计算出显示线
    let left = moveX - dragState.startX + dragState.startLeft
    let top = moveY - dragState.startY + dragState.startTop

    let y = null,
      x = null

    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { top: t, showTop: s } = dragState.lines.y[i] // 获取每一根线

      if (Math.abs(t - top) < 5) { // 距离小于五，说明接近了
        y = s // 确定线的位置
        moveY = dragState.startY - dragState.startTop + t // 容器距离顶部的距离 + 目标的高度 就是最新的moveY

        break // 找到一根线后就跳出循环
      }
    }

    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { left: l, showLeft: s } = dragState.lines.x[i]

      if (Math.abs(l - left) < 5) {
        x = s
        moveX = dragState.startX - dragState.startLeft + l

        break;
      }
    }

    markLine.x = x // markline 是一个响应式数据 x，y更新了会导致视图更新
    markLine.y = y

    // 计算之前和之后的距离
    let durX = moveX - dragState.startX
    let durY = moveY - dragState.startY

    focusData.value.focus.forEach((c, i) => {
      c.top = dragState.startPos[i].top + durY
      c.left = dragState.startPos[i].left + durX
    })

  }

  const mouseup = (e: MouseEvent) => {
    document.removeEventListener('mousemove', mousemove)
    document.removeEventListener('mouseup', mouseup)

    markLine.x = null
    markLine.y = null

    if(dragState.dragging){ // 如果只是点击就不会触发
      event.emit('end')
    }
  }

  return {
    mousedown,
    markLine
  }

}