
export interface IBaseConfigContainer {
  width?: number,
  height?: number
}

export interface IBaseConfigBlocks extends IBaseConfigContainer {
  top: number,
  left: number,
  zIndex: number,
  key: any,
  alignCenter: boolean,
  focus?: boolean
  [key: string]: any
}

export interface IBaseConfigData {
  container: IBaseConfigContainer
  blocks: IBaseConfigBlocks[]
}

export interface IComponentConfig {
  label: string,
  key: EComponentKey,
  render: () => JSX.Element | string,
  preview: () => JSX.Element | string,
}

export enum EComponentKey {
  input = 'input',
  button = 'button',
  text = 'text'
}

export interface IRegisterConfig {
  componentList: IComponentConfig[]
  componentMap: { [key: string]: any },
  register: (component: IComponentConfig) => void
}

export interface IDragState {
  startX: number,
  startY: number,
  dragging: boolean,
  [key: string]: any
}

interface ILine {
  showTop?: number,
  top?: number,
  showLeft?: number,
  left?: number
}

export interface ILines {
  x: ILine[],
  y: ILine[]
}

export interface IButtonFunList {
  label: string | (() => string),
  icon: string | (() => string),
  handler: () => void
}

export enum EButtonFun {
  Redo = 'redo',
  Undo = 'undo',
  Drag = 'drag',
  UpdateContainer = 'updateContainer',
  UpdateBlock = 'updateBlock',
  PlaceTop = 'placeTop',
  PlaceBottom = 'placeBottom',
  Delete = 'delete'
}

export interface IExecute {
  [EButtonFun.Redo]: (argu?: any) => void,
  [EButtonFun.Undo]: (argu?: any) => void,
  [EButtonFun.Drag]: (argu?: any) => void,
  [EButtonFun.UpdateContainer]: (argu?: any) => void,
  [EButtonFun.UpdateBlock]: (argu?: any) => void,
  [EButtonFun.PlaceBottom]: (argu?: any) => void,
  [EButtonFun.PlaceTop]: (argu?: any) => void,
  [EButtonFun.Delete]: (argu?: any) => void,
}

export interface IRegisterOption {
  name: EButtonFun,
  keyboard?: string,
  before?: any,
  init?: () => void,
  execute: (argu?: any) => IExecute,
  pushQueue?: boolean
}

export interface IButtonFunState {
  current: number,
  queue: IExecute[],
  commands: IExecute,
  commandArray: IRegisterOption[],
  destroyArray: any[]
}