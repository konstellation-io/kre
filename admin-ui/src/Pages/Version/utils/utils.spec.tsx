import { VersionStatus } from 'Graphql/types/globalTypes';
import { getVersionActionButtons } from './generators';

const f = jest.fn();
function getButtons(status) {
  return getVersionActionButtons(f, f, f, f, status);
}

describe('getVersionActionButtons', () => {
  it('works with undefined status', () => {
    expect(getButtons()).toStrictEqual([]);
  });

  it('returns no buttons for unknown state', () => {
    expect(getButtons('unknownState')).toStrictEqual([]);
  });

  it('returns right buttons for version STOPPED', () => {
    const buttons = getButtons(VersionStatus.STOPPED);
    expect(buttons.length).toBe(1);
    expect(buttons[0].key).toBe('START');
  });

  it('returns right buttons for version PUBLISHED', () => {
    const buttons = getButtons(VersionStatus.PUBLISHED);
    expect(buttons.length).toBe(1);
    expect(buttons[0].key).toBe('UNPUBLISH');
  });

  it('returns right buttons for version STARTED', () => {
    const buttons = getButtons(VersionStatus.STARTED);
    expect(buttons.length).toBe(2);
    expect(buttons[0].key).toBe('PUBLISH');
    expect(buttons[1].key).toBe('STOP');
  });
});
