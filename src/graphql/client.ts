import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { parseDate } from '../utils/date';

const httpLink = createHttpLink({
  uri: 'https://api.gankaotest2.com/api-jianke/graphql',
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      CourseScheduling: {
        fields: {
          startTime: {
            read: (value) => (value ? parseDate(value) : null),
          },
          endTime: {
            read: (value) => (value ? parseDate(value) : null),
          },
        },
      },
    },
  }),
});
