import { computed, ref, ComputedRef, Ref } from 'vue'
import { IBaseConfigBlocks, IBaseConfigData } from "@/modules/InterEditor";


export function useFocus(
  data: ComputedRef<IBaseConfigData>,
  previewRef: Ref,
  cb: (e: MouseEvent) => void
) {
  const selectIndex = ref(-1) // -1表示没有一个元素被选中

  const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value])

  const focusData = computed(() => {
    let focus: IBaseConfigBlocks[] = []
    let unfocused: IBaseConfigBlocks[] = []

    data.value.blocks.forEach(c => (c.focus ? focus : unfocused).push(c))

    return {
      focus,
      unfocused
    }
  })

  const clearBlockFocus = () => {
    data.value.blocks.forEach(c => c.focus = false)
  }

  const containerMousedown = () => {
    if(previewRef.value) {
      return
    }
    clearBlockFocus()
    selectIndex.value = -1
  }

  const blockMousedown = (
    e: MouseEvent,
    block: IBaseConfigBlocks,
    index: number
  ) => {
    if(previewRef.value) {
      return
    }
    e.preventDefault()
    e.stopPropagation()

    if(e.shiftKey) {
      block.focus = focusData.value.focus.length <= 1 ? true : !block.focus
    } else {
      if(!block.focus) {
        clearBlockFocus()
        block.focus = true
      }
    }

    selectIndex.value = index
    cb(e)
  }

  return {
    blockMousedown,
    containerMousedown,
    lastSelectBlock,
    focusData,
    clearBlockFocus
  }
}