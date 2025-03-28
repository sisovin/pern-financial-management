import { addDecorator } from '@storybook/react';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { withThemesProvider } from 'storybook-addon-styled-component-theme';
import theme from '../src/config/theme';

const themes = [theme];

addDecorator(withThemesProvider(themes));
addDecorator((story) => <ThemeProvider>{story()}</ThemeProvider>);
