import Alert from '@mui/material/Alert';
export default function AlertBox({ message, action, handleAlertClose }) {

  return(
    <Alert onClose={handleAlertClose} severity={action}>{message}</Alert>
  )
}