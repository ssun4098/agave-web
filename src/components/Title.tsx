interface Props {
    title: string
    subTitle?: string
    actions?: React.ReactNode
}

function Title(props: Props) {
    return <>
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h1
              className="text-4xl font-extrabold text-on-surface font-headline tracking-tight mb-2"
            >
              {props.title}
            </h1>
            <p className="text-on-surface-variant body-lg">
              {props.subTitle}
            </p>
          </div>
          {props.actions && <div className="flex space-x-3">{props.actions}</div>}
        </div>
    </>
}

export default Title;