import { View } from 'react-native';

import { TextField, Text } from './Basics';

export const FormRow = ({ children, label, style = {} }) => (
  <View style={{ width: '100%', paddingVertical: 10, ...style }}>
    {label && (
      <Text style={{ paddingBottom: 5, fontSize: 12, fontWeight: 500 }}>
        {label}
      </Text>
    )}
    {children}
  </View>
);

export const InputRow = ({ label, ...rest }) => (
  <FormRow label={label}>
    <TextField testID={label} {...rest} />
  </FormRow>
);
