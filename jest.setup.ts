// Official jest mocks shipped by the libraries; tests never touch native modules or the network.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// The api client logs every request in __DEV__ (useful in Metro); keep test output readable.
jest.spyOn(console, 'log').mockImplementation(() => {});
