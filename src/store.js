import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import userReducer from './reducers/userReducer';
import cartReducer from './reducers/cartReducer';
import generalReducer from './reducers/generalReducer';

const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  general: generalReducer
});

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(persistedReducer);
export const persistor = persistStore(store);