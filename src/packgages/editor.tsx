import {
  defineComponent,
  PropType,
  computed,
  ref,
  inject
} from 'vue'

import './editor.scss'

import {
  IBaseConfigData,
  IComponentConfig,
  IRegisterConfig
} from '../modules/InterEditor'

import EditorBlock from './editorBlock'

import {
  useMenuDragger
} from "../hooks/useMenuDragger"

import { useFocus } from '@/hooks/useFocus'

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
    }) as any as { value: IBaseConfigData }

    const containerRef = ref(null)

    const { dragstart, dragend } = useMenuDragger(containerRef, data) // 加载拖拽hook

    let { blockMousedown, focusData, containerMousedown, lastSelectBlock } = useFocus(data, e => {

    })

    const config: IRegisterConfig | any = inject('config')

    const { width, height } = data.value.container

    const containerStyles = computed(() => ({
      width: `${width}px`,
      height: `${height}px`
    }))


    return () => {
      return (
        <div class="editor">
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
          <div class="editor-right">属性控制栏目</div>
          <div class="editor-container">
            <div class="editor-container-canvas">
              <div
                class="editor-container-canvas__content"
                style={containerStyles.value}
                ref={containerRef}
                onMousedown={containerMousedown}
              >
                {data.value.blocks.length}
                {
                  (data.value.blocks.map((block, index) => (
                    <div onMousedown={(e: MouseEvent) => blockMousedown(e, block, index)}>
                      <EditorBlock
                        class={block.focus ? 'editor-block-focus' : ''}
                        block={block}
                      ></EditorBlock>
                    </div>
                  )))
                }
              </div>
            </div>
          </div>
        </div>
      )
    }
  }


})