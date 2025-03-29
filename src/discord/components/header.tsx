type Props = {
  title      : string
  description: string
}

export const Header = (props: Props) => {
  return (
    <embed title={props.title}>
      {props.description}
    </embed>
  )
}
