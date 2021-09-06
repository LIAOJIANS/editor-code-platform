import {
  defineComponent,
  computed,
  PropType,
  inject,
  ref,
  onMounted
} from 'vue'

import {
  IBaseConfigBlocks,
  IRegisterConfig,
} from '../modules/InterEditor'


export default defineComponent({
  props: {
    block: {
      type: Object as PropType<IBaseConfigBlocks>,
      required: true
    }
  },

  setup(props) {

    const blickStyle = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: `${props.block.zIndex}`
    })) as { value: { [key: string]: any }}

    const config = inject('config') as IRegisterConfig
    const blockRef = ref(null)

    onMounted(() => {
      let { offsetWidth, offsetHeight } = blockRef.value as any

      if(props.block.alignCenter) {
        props.block.left = props.block.left - offsetWidth / 2
        props.block.top = props.block.top - offsetHeight / 2
        props.block.alignCenter = false
      }

      props.block.width = offsetWidth;
      props.block.height = offsetHeight;
    })

    return () => {
      const component = config.componentMap[props.block.key]
      
      const RenderComponent = component.render()

      return  <div class="editor-block" style={blickStyle.value} ref={blockRef}>
        {RenderComponent}
      </div>
    }
  }
})