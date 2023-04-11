/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const s3DeleteObject = /* GraphQL */ `
  mutation S3DeleteObject($bucket: String!, $key: String!) {
    s3DeleteObject(bucket: $bucket, key: $key) {
      message
    }
  }
`;
export const s3DeleteObjectByPrefix = /* GraphQL */ `
  mutation S3DeleteObjectByPrefix($bucket: String!, $prefix: String!) {
    s3DeleteObjectByPrefix(bucket: $bucket, prefix: $prefix) {
      message
    }
  }
`;
export const createFileManager = /* GraphQL */ `
  mutation CreateFileManager(
    $input: CreateFileManagerInput!
    $condition: ModelFileManagerConditionInput
  ) {
    createFileManager(input: $input, condition: $condition) {
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
export const updateFileManager = /* GraphQL */ `
  mutation UpdateFileManager(
    $input: UpdateFileManagerInput!
    $condition: ModelFileManagerConditionInput
  ) {
    updateFileManager(input: $input, condition: $condition) {
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
export const deleteFileManager = /* GraphQL */ `
  mutation DeleteFileManager(
    $input: DeleteFileManagerInput!
    $condition: ModelFileManagerConditionInput
  ) {
    deleteFileManager(input: $input, condition: $condition) {
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
