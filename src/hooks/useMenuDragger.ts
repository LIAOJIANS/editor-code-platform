
import { 
  IBaseConfigData, 
  IComponentConfig 
} from '@/modules/InterEditor'
import { Ref } from '@vue/runtime-core'
import { event } from '../utils/event'

export function useMenuDragger(
  containerRef: Ref,
  data: { value: IBaseConfigData }
) {
  
  let currentComponent: IComponentConfig  = {} as any as IComponentConfig

  let newData = {} as IBaseConfigData

  const dragHandle = (e: DragEvent, type: DataTransfer['dropEffect']) => {

    e.dataTransfer?.dropEffect && (
      e.dataTransfer.dropEffect = type
    )
    
  }

  const dragover = (e: DragEvent) =>  e.preventDefault()

  const drop = (e: DragEvent) => {
  
    let block = data.value.blocks

    data.value = {
      ...data.value,
      blocks: [
        ...block,
        {
          top:e.offsetY,
          left:e.offsetX,
          zIndex:1,
          key: currentComponent.key,
          alignCenter:true // 希望松手的时候你可以居中
        }
      ]
    }
    
    currentComponent = {} as any as IComponentConfig
  }

  const dragstart = (_: any, component: IComponentConfig) => {
    
    containerRef.value.addEventListener('dragenter', (e: DragEvent) => dragHandle(e, 'move')) // 进入元素中 添加一个移动的标识
    containerRef.value.addEventListener('dragover', dragover) //  在目标元素经过 必须要阻止默认行为 否则不能触发drop
    containerRef.value.addEventListener('dragleave', (e: DragEvent) => dragHandle(e, 'none')) // 离开元素的时候 需要增加一个禁用标识
    containerRef.value.addEventListener('drop', drop) // 松手的时候 根据拖拽的组件 添加一个组件
    currentComponent = component
    event.emit('start'); // 发布start
}
const dragend = (_: any)=>{
    containerRef.value.removeEventListener('dragenter', (e: DragEvent) => dragHandle(e, 'move'))
    containerRef.value.removeEventListener('dragover', dragover)
    containerRef.value.removeEventListener('dragleave', (e: DragEvent) => dragHandle(e, 'none'))
    containerRef.value.removeEventListener('drop', drop)
    event.emit('end'); // 发布end
}

  return {
    dragstart,
    dragend,
    newData
  }
}