import {
  ElDialog,
  ElButton,
  ElInput
} from "element-plus";

import {
  createVNode,
  defineComponent,
  PropType,
  reactive,
  render
} from "vue"

const DialogComponent = defineComponent({
  props: {
    option: { type: Object } as any
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false
    })
    ctx.expose({ // 让外界可以调用组件的方法
      showDialog(option: any) {
        state.option = option
        state.isShow = true
      }
    });
    const onCancel = () => {
      state.isShow = false
    }
    const onConfirm = () => {
      state.isShow = false
      state.option.onConfirm && state.option.onConfirm(state.option.content)
    }
    return () => {
      return <ElDialog v-model={state.isShow} title={state.option.title}>
        {{
          default: () => <ElInput
            type="textarea"
            v-model={state.option.content}
          ></ElInput>,
          footer: () => state.option.footer && <div>
            <ElButton onClick={onCancel}>取消</ElButton>
            <ElButton type="primary" onClick={onConfirm}>确定</ElButton>
          </div>
        }}
      </ElDialog>
    }
  }
})

let vm: any
export function $dialog(option: any) {
  if (!vm) {
    let el = document.createElement('div')
    vm = createVNode(DialogComponent, { option })

    // 这里需要将el 渲染到我们的页面中
    document.body.appendChild((render(vm, el), el))
  }
  let { showDialog } = vm.component.exposed
  showDialog(option)
}