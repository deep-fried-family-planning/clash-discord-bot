import {COLOR, nColor} from '#src/constants/colors.ts';



type Props = {
  title: string;
  description: string;
}

export const OmniTitleEmbed = (props: Props) => {
  return (
    <embed color={nColor(COLOR.ORIGINAL)}>
      <title>
        {props.title}
      </title>
      <description>
        {props.description}
      </description>
    </embed>
  )
}
