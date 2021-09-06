
export interface IBaseConfigContainer {
  width: number,
  height: number
}

export interface IBaseConfigBlocks {
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