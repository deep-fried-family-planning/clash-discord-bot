type Props = {
  title: string;
  description: string;
}

export const Header: DSX.FC<Props> = (props) => {
  return (
    <embed title={props.title}>
      {props.description}
    </embed>
  );
};
