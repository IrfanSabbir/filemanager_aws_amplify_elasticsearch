import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';


export default function PdfViewModal({
  open,
  setOpen,
  pdfKey,
  signedURL
}) {
  // pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () =>
    setPageNumber(pageNumber - 1 <= 1 ? 1 : pageNumber - 1);

  const goToNextPage = () =>
    setPageNumber(
      pageNumber + 1 >= numPages ? numPages : pageNumber + 1,
    );


  return (
    <div>

      <Dialog
        maxWidth='lg'
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          {pdfKey}
          <hr />
        </DialogTitle>
        <DialogContent>
          <Box textAlign={'center'}>
            <Button onClick={goToPrevPage}>
              Prev
            </Button>
            <Button onClick={goToNextPage}>
              Next
            </Button>

            <p>
              Page {pageNumber} of {numPages}
            </p>
          </Box>

          <Document
            file={signedURL}
            options={{ workerSrc: "/pdf.worker.js" }}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page pageNumber={pageNumber} />
          </Document>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => window.location.href = signedURL}>
            Download
          </Button>
          <Button onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}