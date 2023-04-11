import React, { useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Grid'
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import { categories, subMenu } from './category';
import PdfViewModal from './PdfViewModal'
import { getSignedUrl, getListS3KeysFromPrefix } from "../../graphql/queries";
import { deleteFileManager,s3DeleteObject, s3DeleteObjectByPrefix } from "../../graphql/mutations";
import AlertBox from './Alert';
import styles from './FIleUploader.module.css';
import Button from '@mui/material/Button';


const bucketList = {
  MAIN_FILE: "main_file",
  SPLITTED_FILE: "splitted_file"
}

const SPLITTED_FILE_ACCESS_LEVEL = 'done';
const MAIN_FILE_ACCESS_LEVEL = 'public';

const s3Buckets = {
  "main_file": "acubed13fa2cc09404d5a9a6b76de4bbf8a7213210-dev",
  "splitted_file": "splitedfile"
}

const ListFIles = ({
  listItems,
  handleRefresh
}) => {
  const [expandIndex, setExpandIndex] = useState(-1)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [pdfKey, setPdfKey] = useState(null)
  const [s3SplittedFiles, setS3SplittedFiles] = useState([])

  const [loading, setLoading] = useState(false)
  const [loadingIndex, setLoadingIndex] = useState(-1)
  const [open, setOpen] = useState(false)
  const [fileAlert, setFileAlert] = useState({
    action: '',
    message: ''
  });

  const getCategoryName = (value) => {
    return categories.find(item => item.value === value)?.name || ""
  }
  const getSubCategoryName = (categoryValue, subValue) => {
    return subMenu[categoryValue].find(item => item.value === subValue)?.name || ""
  }

  const handleMainFileS3SignedString = async (key, bucketname, accessLevel) => {
    console.log(key)
    setLoading(true)
    setPdfKey(key)
    try {
      const signedUrlResult = await API.graphql(
        graphqlOperation(getSignedUrl, { bucket: s3Buckets[bucketname], key: `${accessLevel}/${key}` })
      );
      console.log('signedUrl', signedUrlResult.data.getSignedUrl);
      setPdfUrl(signedUrlResult.data.getSignedUrl?.signedUrl)
      setLoading(false)
      setOpen(true)
    } catch (error) {
      setLoading(false)
    }
  }

  const handleLoadPrefixFilesKey = async (key) => {
    setLoading(true)
    setS3SplittedFiles([])
    const prefixOfCurrentFIle = key.split('.')[0];
    const params = {
      bucket: s3Buckets.splitted_file,
      prefix: `${SPLITTED_FILE_ACCESS_LEVEL}/${prefixOfCurrentFIle}_`
    };
    const listSubFilesList = await API.graphql(
      graphqlOperation(getListS3KeysFromPrefix, params)
    );
    const files = listSubFilesList.data.getListS3KeysFromPrefix["s3Keys"]
    if (files) {
      const s3Keys = files.filter(Key => Key.split('.')[1] === 'pdf').map(Key => Key.split('/')[1]);
      console.log(s3Keys)
      setS3SplittedFiles(s3Keys)
    }

    console.log(listSubFilesList)
    setLoading(false)

  }

  const handleDeleteFile = async (key, id) => { 
    setLoading(true)
    try {
      const params = {
        bucket: s3Buckets.main_file,
        key: `${MAIN_FILE_ACCESS_LEVEL}/${key}`
      };
      const deleteFilePromise=  API.graphql(
        graphqlOperation(s3DeleteObject, params)
      );
  
      const prefixOfCurrentFIle = key.split('.')[0];
      const splittedParams = {
        bucket: s3Buckets.splitted_file,
        prefix: `${SPLITTED_FILE_ACCESS_LEVEL}/${prefixOfCurrentFIle}_`
      };
      const deleteSplittedFilePromise = API.graphql(
        graphqlOperation(s3DeleteObjectByPrefix, splittedParams)
      );
  
      const deleteFileManagerPromise = API.graphql(
        graphqlOperation(deleteFileManager, { input: { id: id } })
      )
  
      const result = await Promise.all([deleteFilePromise, deleteSplittedFilePromise, deleteFileManagerPromise])
      console.log(result)
      setFileAlert({  action: 'success', message: 'File deleted successfully' })
      setTimeout(() => {
        handleRefresh()
      }, 1000)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setFileAlert({ action: 'error', message: 'Error while deleting file'})
      setLoading(false)
    }
  }

  const handleAlertClose = () => {
    setFileAlert({
      action: '',
      message: ''
    })
  }


  return (
    <div>
      {
        fileAlert.message && 
        <AlertBox
          action={fileAlert.action}
          message={fileAlert.message}
          handleAlertClose={handleAlertClose}
        />
      }
      {
        listItems.map((item, index) => {
          return (
            <Accordion key={index} expanded={Boolean(expandIndex === index)} style={{ marginBottom: "10px" }} elevation={1} >

              <AccordionSummary
                expandIcon={<ExpandMoreIcon onClick={(e) => {
                  // console.log(e)
                  if (expandIndex !== index) {
                    setLoadingIndex(index)
                    handleLoadPrefixFilesKey(item.key);
                  }
                    setExpandIndex(expandIndex === index ? -1 : index)
                }
                } />}
                aria-controls="panel1a-content"
                id="panel2a-header"
                sx={{ flexGrow: 1 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Grid container spacing={2} style={{ width: '90%' }}>
                  <Grid item xs={12} sm={6} md={6} lg={7}>
                    <Typography
                      style={{ overflowWrap: 'break-word', width: "90%" }}
                      onClick={() => {
                        setPdfKey(item.key)
                        handleMainFileS3SignedString(item.key, bucketList.MAIN_FILE, MAIN_FILE_ACCESS_LEVEL);
                        setLoadingIndex(index)
                      }
                      }
                    >
                      {item.key}{" "}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={5}>
                    <div style={{ display: "flex", flexFlow: 'row-reverse', width: '100%' }}>
                        { 
                          Boolean(loadingIndex === index) && loading &&
                          <span style={{ marginLeft: "20px" }}><CircularProgress size={30} /></span> 
                          
                        }
                        <CloseIcon onClick={() => {
                          setLoadingIndex(index)
                          handleDeleteFile(item.key, item.id);
                        }} style={{ marginLeft: "20px" }} />

                      <Typography style={{ marginLeft: "20px" }}>{item.createdAt.split('T')[0]}</Typography>

                      <Typography style={{ marginLeft: "20px" }}>{getSubCategoryName(item.category, item.subCategory)}</Typography>
                      <Typography >{getCategoryName(item.category)}</Typography>

                    </div>
                  </Grid>

                </Grid>
              </AccordionSummary>
              <AccordionDetails>

                {
                  s3SplittedFiles.length === 0 && !loading &&
                  <Typography>No Splitted Files Found</Typography>
                }
                {
                  s3SplittedFiles &&
                  s3SplittedFiles.map(key => {
                    return (
                    <div className={styles.file_select_container} key={key}>
                      <div className={styles.left_content}>
                        <Button
                          
                          variant="text"
                          // style={{ cursor: "pointer"}}
                          onClick={() => {
                            setPdfKey(key)
                            handleMainFileS3SignedString(key, bucketList.SPLITTED_FILE, SPLITTED_FILE_ACCESS_LEVEL);
                            setLoadingIndex(index)
                          }
                          }
                        >
                          {key}{" "}{" "}
                          {key === pdfKey && loading &&
                            <CircularProgress size={20} />
                          }
                        </Button>
                      </div>
                      <div className={styles.right_content}>
                        <div className={item.elab === 1 ? styles.green_elab : styles.red_elab}/>
                      </div>
                    </div>
                    )
                  })
                }
              </AccordionDetails>
            </Accordion>
          );
        })
      }

      {
        Boolean(open && pdfUrl) &&
        <PdfViewModal
          open={open}
          setOpen={setOpen}
          pdfKey={pdfKey}
          signedURL={pdfUrl}
        />
      }
    </div>
  );
};

export default ListFIles;
