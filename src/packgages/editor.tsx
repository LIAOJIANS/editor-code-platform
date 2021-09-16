import {
  defineComponent,
  PropType,
  computed,
  ref,
  inject,
  ComputedRef
} from 'vue'

import './editor.scss'

import {
  IBaseConfigData,
  IButtonFunList,
  IComponentConfig,
  IExecute,
  IRegisterConfig,
  EButtonFun,
  IBaseConfigBlocks
} from '../modules/InterEditor'

import EditorBlock from './editorBlock'
import { $dialog } from "./dialog"

import { useMenuDragger } from "../hooks/useMenuDragger"
import { useFocus } from '@/hooks/useFocus'
import { useBlockDragger } from '@/hooks/useBlockDragger'
import { useCommand } from '@/hooks/useButtonFun'
import { $dropdown, DropdownItem } from "./dropdown"

export default defineComponent({

  props: {
    modelValue: { type: Object } as any as PropType<IBaseConfigData>
  },

  setup(props, ctx) {

    const data = computed({
      get() {
        return props.modelValue
      },

      set(newVal) {
        ctx.emit('update:modelValue', JSON.parse(JSON.stringify(newVal)))
      }
    }) as any as ComputedRef<IBaseConfigData>

    const containerRef = ref(null)
    const previewRef = ref(false)
    const editorRef = ref(true)

    const { dragstart, dragend } = useMenuDragger(containerRef, data) // 加载拖拽hook

    let {
      blockMousedown,
      focusData,
      containerMousedown,
      lastSelectBlock,
      clearBlockFocus
    } = useFocus(data, previewRef, e => {
      mousedown(e) // 获取焦点后进行拖拽
    })

    // 拖拽hooks
    let { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data);

    const config: IRegisterConfig | any = inject('config')

    const { width, height } = data.value.container

    const containerStyles = computed(() => ({
      width: `${width}px`,
      height: `${height}px`
    }))

    const state = useCommand(focusData, data)
    const commands = state.commands as any as IExecute
    console.log(commands)

    const buttonFunList: IButtonFunList[] = [
      { label: '撤销', icon: 'icon-back', handler: () => commands[EButtonFun.Undo]() },
      { label: '重做', icon: 'icon-forward', handler: () => commands[EButtonFun.Redo]() },
      {
        label: '导出', icon: 'icon-export', handler: () => {
          $dialog({
            title: '导出json使用',
            content: JSON.stringify(data.value),
          })
        }
      },
      {
        label: '导入', icon: 'icon-import', handler: () => {
          $dialog({
            title: '导入json使用',
            content: '',
            footer: true,
            onConfirm(text: string) {
              commands[EButtonFun.UpdateContainer](JSON.parse(text));
            }
          })
        }
      },
      { label: '置顶', icon: 'icon-place-top', handler: () => commands[EButtonFun.PlaceTop]() },
      { label: '置底', icon: 'icon-place-bottom', handler: () => commands[EButtonFun.PlaceBottom]() },
      { label: '删除', icon: 'icon-delete', handler: () => commands[EButtonFun.Delete]() },

      {
        label: () => previewRef.value ? '编辑' : '预览', icon: () => previewRef.value ? 'icon-edit' : 'icon-browse', handler: () => {
          previewRef.value = !previewRef.value
          console.log(previewRef)
          clearBlockFocus();
        }
      },
      {
        label: '关闭', icon: 'icon-close', handler: () => {

          editorRef.value = false;
          clearBlockFocus();
        }
      },
    ]

    const onContextMenuBlock = (e: MouseEvent, block: IBaseConfigBlocks) => {
      e.preventDefault();
      $dropdown({
        el: e.target, // 以哪个元素为准产生一个dropdown
        content: () => {
          return <>

            <div onClick={() => commands[EButtonFun.Delete]()}><DropdownItem label="删除" icon="icon-delete" ></DropdownItem></div>
            <div onClick={() => commands[EButtonFun.PlaceTop]()}><DropdownItem label="置顶" icon="icon-place-top" ></DropdownItem></div>
            <div onClick={() => commands.placeBottom()}>
              <DropdownItem label="置底" icon="icon-place-bottom" ></DropdownItem>
            </div>
            <div onClick={() => {
              $dialog({
                title: '查看节点数据',
                content: JSON.stringify(block)
              })
            }}>

              <DropdownItem label="查看" icon="icon-browse" ></DropdownItem>
            </div>
            <div onClick={() => {
              $dialog({
                title: '导入节点数据',
                content: '',
                footer: true,
                onConfirm(text: string) {
                  text = JSON.parse(text);
                  commands.updateBlock({ text, block })
                }
              })
            }}>

              <DropdownItem label="导入" icon="icon-import" ></DropdownItem>
            </div>
          </>
        }
      })
    }

    return () => {
      const editorBlockClass = previewRef.value ? 'editor-block-preview' : ''
      return (
        !editorRef.value ? <>
          <div
            class="editor-container-canvas__content"
            style={containerStyles.value}
          >
            {
              (data.value.blocks.map((block, index) => (
                <EditorBlock
                  class='editor-block-preview'
                  block={block}
                ></EditorBlock>
              )))
            }
          </div>
          <div><button onClick={() => editorRef.value = true}>继续编辑</button></div>

        </> : <div class="editor">
          <div class="editor-left">
            {/* 根据注册列表 渲染对应的内容  可以实现h5的拖拽*/}
            {config.componentList.map((component: IComponentConfig) => (
              <div
                class="editor-left-item"
                draggable
                onDragstart={e => dragstart(e, component)}
                onDragend={dragend}
              >
                <span>{component.label}</span>
                <div>{component.preview()}</div>
              </div>
            ))}
          </div>
          <div class="editor-top">
            {buttonFunList.map((btn, index) => {
              return <div class="editor-top-button" onClick={btn.handler}>
                <i class={typeof btn.icon === 'function' ? btn.icon() : btn.icon}></i>
                <span>{typeof btn.label === 'function' ? btn.label() : btn.label}</span>
              </div>
            })}
          </div>
          <div class="editor-right">属性控制栏目</div>
          <div class="editor-container">
            <div class="editor-container-canvas">
              <div
                class="editor-container-canvas__content"
                style={containerStyles.value}
                ref={containerRef}
                onMousedown={containerMousedown}
              >
                {
                  (data.value.blocks.map((block, index) => (
                    <div
                      onMousedown={(e: MouseEvent) => blockMousedown(e, block, index)}
                      onContextmenu={(e: MouseEvent) => onContextMenuBlock(e, block)}
                    >
                      <EditorBlock
                        class={block.focus ? `editor-block-focus` : `${editorBlockClass}`}
                        block={block}
                      ></EditorBlock>
                    </div>
                  )))
                }

                {markLine.x !== null && <div class="line-x" style={{ left: markLine.x + 'px' }}></div>}
                {markLine.y !== null && <div class="line-y" style={{ top: markLine.y + 'px' }}></div>}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }


})