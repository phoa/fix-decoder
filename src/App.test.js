import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

/**
 * Sample FIX message
 * 8=FIX.4.2|9=130|35=D|34=659|49=BROKER04|56=REUTERS|52=20070123-19:09:43|38=1000|59=1|100=N|40=1|11=ORD10001|60=20070123-19:01:17|55=HPQ|54=1|21=2|10=004|
 * 8=FIX.4.2_9=130_35=D_34=659_49=BROKER04_56=REUTERS_52=20070123-19:09:43_38=1000_59=1_100=N_40=1_11=ORD10001_60=20070123-19:01:17_55=HPQ_54=1_21=2_10=004_
 * 8=FIX.4.2┌9=130┌35=D┌34=659┌49=BROKER04┌56=REUTERS┌52=20070123-19:09:43┌38=1000┌59=1┌100=N┌40=1┌11=ORD10001┌60=20070123-19:01:17┌55=HPQ┌54=1┌21=2┌10=004┌
 */

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
