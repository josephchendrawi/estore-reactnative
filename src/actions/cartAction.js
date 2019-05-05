import * as actionTypes from './types';

export const cartUpdateSelection = (item, newValue) => {
  return {
    type: actionTypes.CART_SELECTION_UPDATE,
    payload: { item: item, newValue: newValue }
  }
}

export const cartClearSelection = () => {
  return {
    type: actionTypes.CART_SELECTION_CLEAR,
    payload: {}
  }
}