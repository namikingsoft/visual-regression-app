// @flow
import opts from 'opts';
import { buildDiffImagesFromLocal } from 'domains/DiffBuildBackend';

opts.parse(
  [
    {
      short: 'a',
      long: 'actual',
      description: 'Description',
      value: true,
      required: true,
    },
    {
      short: 'e',
      long: 'expect',
      description: 'Description',
      value: true,
      required: true,
    },
    {
      short: 'o',
      long: 'output',
      description: 'Description',
      value: true,
      required: true,
    },
    {
      short: 't',
      long: 'threshold',
      description: 'Description',
      value: true,
    },
  ],
  true,
);

(async () => {
  const result = await buildDiffImagesFromLocal({
    actualPath: opts.get('actual'),
    expectPath: opts.get('expect'),
    outputPath: opts.get('output'),
    threshold: Number(opts.get('threshold') || 0.005),
  });
  console.info('test');
  console.log(JSON.stringify(result));
})();
