import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import { Flex, Button } from "@aws-amplify/ui-react";
import { Storage } from "aws-amplify";
import { API, graphqlOperation } from 'aws-amplify';

import { createFileManager } from "../../graphql/mutations";
import { fileTypes, categories, subMenu } from './category';
import styles from './FIleUploader.module.css';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';

import AlertBox from './Alert';

const FileUploadeCompont = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [category, setCategorie] = useState('');
  const [subCategory, setSubCategorie] = useState('');
  const [elab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [fileError, setFileError] = useState('');
  const [uploadAlert, setUploadAlert] = useState({
    action: '',
    message: ''
  });

  const handleCategoryChange = () => {
    if (category && subCategory) {
      setCategoryError('')
    }
  }

  const generateUniqueKey = (key) => {
    const currentUniqeTime = new Date().getTime();
    const keyArray = key?.split('.');
    const keyName = keyArray[0];
    const keyExtension = keyArray[1];
    console.log(`{category}_${subCategory}_${keyName}_${currentUniqeTime}.${keyExtension}`)
    return `${category}_${subCategory}_${keyName}_${currentUniqeTime}.${keyExtension}`;
  };
  const handleUpload = async () => {
    handleCategoryChange();
    if (!selectedFiles || selectedFiles.length === 0) {
      setFileError('Please select file')
      console.error('No file selected!');
      return;
    }
    if (!category || !subCategory) {
      setCategoryError('Please select category and sub category')
      console.error('No category selected!');
      return;
    }
    setLoading(true);
    const accessLevel = 'public';
    try {
      const fileUploadPromises = selectedFiles.map((selectedFile) => {
        if (!selectedFile.name) {
          return;
        }
        const filename = generateUniqueKey(selectedFile.name)
        return Storage.put(filename, selectedFile, { level: accessLevel, download: true })
      });
      const result = await Promise.all(fileUploadPromises)
      console.log('File uploaded successfully!', result);

      const uploadedFileKeys = []
      const failedFiles = []

      result.forEach((file, index) => {
        if (file.key) {
          uploadedFileKeys.push(file.key)
        } else {
          failedFiles.push(selectedFiles[index])
        }
      })
      console.log('File processing to s3 completed', {
        "Failed": failedFiles,
        "Sccess": uploadedFileKeys
      });
      createFileEntry(uploadedFileKeys)
    } catch (error) {
      setUploadAlert({
        action: 'error',
        message: 'File uploaded failed! Please try again'
      })
      setLoading(false);
    }

  };

  async function createFileEntry(s3Keys) {
    setLoading(true);
    console.log("Dynamodb Processing will start...")
    const promises = s3Keys.map(s3Key => {
      const createFileInput = {
        category: category,
        subCategory: subCategory,
        elab: elab,
        key: s3Key
      };
      return API.graphql(graphqlOperation(createFileManager, { input: createFileInput }))
    })
    try {
      const result = await Promise.all(promises)
      console.log('File uploaded successfully!', result);
      setUploadAlert({
        action: 'success',
        message: 'File uploaded successfully!'
      })
      clearInput()
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setUploadAlert({
        action: 'error',
        message: 'File uploaded failed! Please try again'
      })
      console.error('Error uploading file:', error);
    }
  }

  const removeFileByIndex = (index) => {
    selectedFiles.splice(index, 1);
    setSelectedFiles([...selectedFiles]);
  }
  const removeAll = () => {
    setSelectedFiles([]);
  }

  const clearInput = () => {
    setCategorie('');
    setSubCategorie('');
    setCategoryError('');
    setFileError('');
    setSelectedFiles([]);
  }

  const handleAlertClose = () => {
    setUploadAlert({
      action: '',
      message: ''
    })
  }

  const handleDrop = (acceptedFiles) => {
    let newFiles = [];
    let skipedFiles = [];

    acceptedFiles.forEach((file) => {
      if (file.type !== 'application/pdf') {
        skipedFiles.push(file);
      } else {
        newFiles.push(file);
      }
    })
    const allFiles = [...selectedFiles, ...newFiles];
    if (allFiles.length > 0) {
      setFileError('')
    }
    if (allFiles.length > 10) {
      setFileError('You can upload maximum 10 files at a time')
      alert('You can upload maximum 10 files at a time');
      return;
    }
    if (skipedFiles.length > 0) {
      alert('WIll only upload PDF files, skipped other files');
    }
    setSelectedFiles([...allFiles]);
    // Handle file upload process
  };

  return (
    <div>
      {
        uploadAlert.message &&
        <AlertBox
          action={uploadAlert.action}
          message={uploadAlert.message}
          handleAlertClose={handleAlertClose}
        />
      }
      <h2>File Uploader</h2>

      <Grid container spacing={2} style={{ width: '100%' }}>
        <Grid item xs={12} sm={6} md={6} lg={6}>
          <FormControl sx={{ m: 1, minWidth: '100%' }} size='small'>
            <InputLabel id="demo-simple-select-autowidth-label">Category</InputLabel>
            <Select
              labelId="demo-simple-select-autowidth-label"
              id="demo-simple-select-autowidth"
              value={category}
              onChange={(e) => {
                setCategorie(e.target.value);
                handleCategoryChange()
              }}
              width="100%"
              label="category"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {
                categories.map((item, index) => {
                  return <MenuItem key={index} value={item.value}>{item.name}</MenuItem>
                })
              }
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={6}>
          <FormControl sx={{ m: 1, minWidth: '100%' }} size='small'>
            <InputLabel id="demo-simple-select-autowidth-label">Sub Manu</InputLabel>
            <Select
              labelId="demo-simple-select-autowidth-label"
              id="demo-simple-select-autowidth"
              value={subCategory}
              onChange={(e) => {
                setSubCategorie(e.target.value);
                handleCategoryChange()
              }}
              width="100%"
              label="subMenu"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {
                category && subMenu[category].map((item, index) => {
                  return <MenuItem key={index} value={item.value}>{item.name}</MenuItem>
                })
              }
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <div className={styles.input_error}>
        {categoryError}
      </div>


      <div className={styles.drop_area}>

        <Dropzone accept="application/pdf" onDrop={handleDrop}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className={styles.drop_zone_text}>
              <input {...getInputProps()} />
              <p>Drag and drop a PDF file here, or click to select a file</p>
            </div>
          )}
        </Dropzone>
      </div>

      <br /><br />
      <div className={styles.input_error}>
        {fileError}
      </div>
      <div className={styles.fileList}>
        {
          selectedFiles.map((file, index) => {
            return (
              <div className={styles.file_select_container} key={index}>
                <div className={styles.left_content}> {file.name}</div>
                <div className={`${styles.right_content} ${styles.content_pointer}`}>
                  <CloseIcon onClick={() => removeFileByIndex(index)} fontSize='medium' />
                </div>

              </div>
            )
          })
        }
      </div>

      <Flex direction="row-reverse" style={{ margin: '20px' }}>
        <Button onClick={handleUpload} isLoading={loading}>Upload files</Button>
        <Button onClick={removeAll} color="blue.60" border="none">Clear All</Button>
      </Flex>

    </div>
  );
};

export default FileUploadeCompont;
