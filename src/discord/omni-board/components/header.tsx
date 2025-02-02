type Props = {
  title: string;
  description: string;
}

export const Header: DSX.FC<Props> = (props) => {
  return (
    <embed>
      <title>{props.title}</title>
      <description>
        <b>{props.description}</b>
      </description>
    </embed>
  );
};
