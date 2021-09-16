
import { 
  IComponentConfig,
  EComponentKey,
  IRegisterConfig
} from '@/modules/InterEditor'

import { 
  ElButton, 
  ElInput 
} from 'element-plus'

function createEditorConfig(): IRegisterConfig {
  const componentList: IComponentConfig[] = []
  const componentMap: { [key: string]: any } = {}
  
  return {
    componentList,
    componentMap,

    register: (component: IComponentConfig) => {
      componentList.push(component)
      componentMap[component.key] = component
    }
  }
}

export let registerConfig = createEditorConfig()

registerConfig.register({
  label: '文本',
  key: EComponentKey.text,
  preview: () => '预览文本',
  render: () => '渲染文本'
})

registerConfig.register({
  label: '按钮',
  preview: () => <ElButton>预览按钮</ElButton>,
  render: () => <ElButton>渲染按钮</ElButton>,
  key: EComponentKey.button
})

registerConfig.register({
  label: '输入框',
  preview: () => <ElInput placeholder="预览输入框"></ElInput>,
  render: () => <ElInput placeholder="渲染输入框"></ElInput>,
  key: EComponentKey.input
})