import React, { useState } from 'react';
import { Button, Grid, Paper, TextField, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { backend } from 'declarations/backend';

const CalculatorPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  maxWidth: 300,
}));

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const performOperation = async (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      setLoading(true);
      try {
        const result = await backend.calculate(operator, firstOperand, inputValue);
        setDisplay(result.toString());
        setFirstOperand(result);
      } catch (error) {
        setDisplay('Error');
      } finally {
        setLoading(false);
      }
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+'
  ];

  return (
    <CalculatorPaper elevation={3}>
      <TextField
        fullWidth
        variant="outlined"
        value={display}
        InputProps={{
          readOnly: true,
        }}
      />
      <Grid container spacing={1} mt={1}>
        {buttons.map((btn) => (
          <Grid item xs={3} key={btn}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                if (btn === '=') {
                  performOperation('=');
                } else if (['+', '-', '*', '/'].includes(btn)) {
                  performOperation(btn);
                } else if (btn === '.') {
                  inputDecimal();
                } else {
                  inputDigit(btn);
                }
              }}
            >
              {btn}
            </Button>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button fullWidth variant="contained" color="secondary" onClick={clear}>
            Clear
          </Button>
        </Grid>
      </Grid>
      {loading && (
        <CircularProgress
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-20px',
            marginLeft: '-20px',
          }}
        />
      )}
    </CalculatorPaper>
  );
};

export default App;