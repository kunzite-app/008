import React from 'react';
import { Text } from './Basics';

const format = (opts = {}) => {
  const { date_from = new Date().getTime(), date_to = new Date().getTime() } =
    opts;

  const delta = Math.abs(date_to - date_from) / 1000;
  const date = new Date(0);
  date.setSeconds(delta);
  return date.toISOString().substring(11, 19);
};

export default class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: null
    };
  }

  componentDidMount() {
    this.initTimer();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  initTimer() {
    const date_from = new Date().getTime();
    this.counter = setInterval(() => {
      const currentTime = format({ date_from });
      this.setState({ currentTime });
    }, 1000);
  }

  clearTimer() {
    const currentTime = format();
    this.setState({ currentTime });
    clearInterval(this.counter);
  }

  render() {
    const { currentTime } = this.state;
    return <Text style={[{ fontSize: 12 }, this.props.style ]}>{currentTime}</Text>;
  }
}
