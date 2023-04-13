import React , { useState }from 'react';
import { API, graphqlOperation } from 'aws-amplify';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress';
import { deleteFileManager,s3DeleteObject, s3DeleteObjectByPrefix } from "../../graphql/mutations";

const SPLITTED_FILE_ACCESS_LEVEL = 'done';
const MAIN_FILE_ACCESS_LEVEL = 'public';

const s3Buckets = {
  "main_file": "acubed13fa2cc09404d5a9a6b76de4bbf8a7213210-dev",
  "splitted_file": "splitedfile"
}

export default function DeleteModalContainer({
  open,
  setOpen,
  pdfKey,
  itemId,
  handleRefresh
}) {
  const [loading, setLoading] = useState(false)
  const [fileAlert, setFileAlert] = useState({
    action: '',
    message: ''
  });

  const handleDeleteFile = async () => { 
    const id = itemId;
    const key = pdfKey;
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
      // setTimeout(() => {
      //   handleRefresh()
      // }, 1000)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setFileAlert({ action: 'error', message: 'Error while deleting file'})
      setLoading(false)
    }
  }

  return (
    <div>

      <Dialog
        maxWidth='lg'
        open={open}
        onClose={() => {
          setOpen(false)
          handleRefresh()
        }}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          {pdfKey}
          <hr />
        </DialogTitle>
        <DialogContent style={{ textAlign: 'center' }}>
        {
            fileAlert.message && 
            <Alert severity={fileAlert.action}>{fileAlert.message}</Alert>
          }
          <DialogContentText>
            <Typography color="red" fontSize={20} fontWeight={'bold'} margin={'10px'}
            >
              Are you sure to Delete this PDF?
              { 
                loading &&
                <span style={{ marginLeft: "20px" }}><CircularProgress size={30} /></span> 
                
              }
            </Typography>
            <Button 
            onClick={handleDeleteFile}
            loading={loading}
            variant="contained" color="error">
              Delete
            </Button>
          </DialogContentText>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            handleRefresh();
            }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}