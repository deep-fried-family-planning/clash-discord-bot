type Props = {
  title: string;
  description: string;
}


export const Header = (props: Props) => {
  return (
    <embed>
      <title>{props.title}</title>;
      <description>{props.description}</description>;
    </embed>
  );
};
