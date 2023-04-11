/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getSignedUrl = /* GraphQL */ `
  query GetSignedUrl($bucket: String!, $key: String!) {
    getSignedUrl(bucket: $bucket, key: $key) {
      signedUrl
    }
  }
`;
export const getListS3KeysFromPrefix = /* GraphQL */ `
  query GetListS3KeysFromPrefix($bucket: String!, $prefix: String!) {
    getListS3KeysFromPrefix(bucket: $bucket, prefix: $prefix) {
      s3Keys
    }
  }
`;
export const searchFileManagers = /* GraphQL */ `
  query SearchFileManagers(
    $filter: SearchableFileManagerFilterInput
    $sort: [SearchableFileManagerSortInput]
    $limit: Int
    $nextToken: String
    $from: Int
    $aggregates: [SearchableFileManagerAggregationInput]
  ) {
    searchFileManagers(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
      aggregates: $aggregates
    ) {
      items {
        id
        key
        category
        subCategory
        elab
        createdAt
        updatedAt
      }
      nextToken
      total
      aggregateItems {
        name
        result {
          ... on SearchableAggregateScalarResult {
            value
          }
          ... on SearchableAggregateBucketResult {
            buckets {
              key
              doc_count
            }
          }
        }
      }
    }
  }
`;
export const getFileManager = /* GraphQL */ `
  query GetFileManager($id: ID!) {
    getFileManager(id: $id) {
      id
      key
      category
      subCategory
      elab
      createdAt
      updatedAt
    }
  }
`;
export const listFileManagers = /* GraphQL */ `
  query ListFileManagers(
    $filter: ModelFileManagerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFileManagers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        key
        category
        subCategory
        elab
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
