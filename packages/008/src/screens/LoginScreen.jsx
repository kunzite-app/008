import { useState } from 'react';
import { View } from 'react-native';

import { Screen } from './Screen';
import { Button, ButtonIcon } from '../components/Basics';
import { FormRow, InputRow } from '../components/Forms';
import { LoginIcon } from '../components/Icons';

import { useStore } from '../store/Context';

const LoginForm = ({ onSubmit, loading }) => {
  const [values, setValues] = useState();

  const setValue = (field, value) => {
    const val = { ...values };
    val[field] = value;

    setValues(val);
  };

  return (
    <View>
      <InputRow
        placeholder={'User'}
        onChange={val => setValue('user', val)}
      />

      <InputRow
        placeholder={'Password'}
        password
        onChange={val => setValue('password', val)}
      />

      <FormRow>
        <Button
          color='primary'
          tabIndex="-1"
          disabled={loading}
          onClick={() => onSubmit?.(values)}
        >
          <LoginIcon />
        </Button>
      </FormRow>
    </View>
  );
};

export const LoginScreen = () => {
  const store = useStore();
  const { showLogin, login, toggleShowSettings } = store;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async values => {
    try {
      setLoading(true);
      await login(values);
    } catch (err) {
      console.log('Error in login request', err);
    } finally {
      setLoading(false);
    }
  };

  const settingsOnClickHandler = () => toggleShowSettings(true, 'settings');

  return (
    <Screen visible={showLogin} style={{ padding: 10 }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center'
        }}
      >
        <LoginForm onSubmit={handleSubmit} loading={loading} />
      </View>

      <ButtonIcon
        style={{ position: 'absolute', right: 5 }}
        icon="settings"
        onClick={settingsOnClickHandler}
      />
    </Screen>
  );
};
