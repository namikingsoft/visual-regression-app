// @flow
import { compose } from 'recompose';
import { translate } from 'react-i18next';
import type { TFunction } from 'i18next';
import { willMount } from 'highorders/lifecycle';

type ReactComponent = any;
type ComposedProps = Object;
type PropsWithTranslator = { t: TFunction };
type Title = string;
type TitleSetter = Title | ComposedProps => Title;

const setTitleOnBrowser:
  Title => void
= title => {
  document.title = title; // eslint-disable-line immutable/no-mutation
};

const extractTitle:
  TitleSetter => ComposedProps => Title
= titleSetter => composedProps => (
  typeof titleSetter === 'function' ?
    titleSetter(composedProps) : titleSetter
);

export const setDocumentTitle:
  TitleSetter => ReactComponent => ReactComponent
= titleSetter => willMount(compose(setTitleOnBrowser, extractTitle(titleSetter)));

export const setDocumentTitleWithAppName:
  TitleSetter => ReactComponent => ReactComponent
= titleSetter => compose(
  translate(''),
  setDocumentTitle((props: PropsWithTranslator) =>
    `${extractTitle(titleSetter)(props)} - ${props.t('app.name')}`,
  ),
);
