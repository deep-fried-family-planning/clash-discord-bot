export const BasicMessage = () => {
  return (
    <message display={'ephemeral'}>
      {'Hello, world!'}
      <embed>
        {'Hello, embed description!'}
        <field name={'field'}>
          {'field text'}
        </field>
      </embed>
    </message>
  );
};
