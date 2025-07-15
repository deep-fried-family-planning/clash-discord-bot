export const TestDialog = () => {
  // const [num, setNum] = useState(0);

  return (
    <modal
      title={'test title'}
      onsubmit={() => {setNum(num + 1);}}
    >
      <textinput label={'test text'}/>
    </modal>
  );
};
