import {usePage} from '#src/disreact/model/danger.ts';
import {useEffect} from '#src/disreact/model/hooks.ts';
import console from 'node:console';

type Props = {
  title: string;
  description: string;
}


export const Header = (props: Props) => {
  useEffect(() => {
    console.log('useEffect')
  });

  return (
    <embed>
      <title>{props.title}</title>
      <description>{props.description}</description>
    </embed>
  );
};
