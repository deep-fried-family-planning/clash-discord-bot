import {useEffect, usePage, useState} from '#src/disreact/index.ts';
import console from 'node:console';



export const CloseButton = () => {
  const page = usePage([]);

  const [num, setNum] = useState(0);

  useEffect(() => {
    console.log('USE_EFFECT_2');
  });

  return (
    <button
      primary
      label={`Close ${num}`}
      onclick={() => setNum(num + 1)}
    />
  );
};
