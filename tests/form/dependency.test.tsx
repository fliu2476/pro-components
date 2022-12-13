import { ProForm, ProFormDependency, ProFormText } from '@ant-design/pro-components';
import { fireEvent, render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { waitForComponentToPaint } from '../util';

describe('ProForm Dependency component', () => {
  it('⛲ shouldUpdate of ProFormDependency is Boolean', async () => {
    const Demo: React.FC<{
      shouldUpdate?: boolean;
    }> = ({ shouldUpdate = false }) => {
      return (
        <ProForm>
          <ProFormText name="name" label="姓名" />
          <ProFormDependency name={['name']} shouldUpdate={shouldUpdate}>
            {({ name }) => {
              return <div id="show">{name || 'first'}</div>;
            }}
          </ProFormDependency>
        </ProForm>
      );
    };

    const html = render(<Demo />);

    act(() => {
      fireEvent.change(html.baseElement.querySelector<HTMLDivElement>('input.ant-input')!, {
        target: {
          value: 'second',
        },
      });
    });

    await waitForComponentToPaint(html);

    expect(html.baseElement.querySelector<HTMLDivElement>('div#show')?.textContent).toBe('first');

    act(() => {
      html.rerender(<Demo shouldUpdate />);
    });

    await waitForComponentToPaint(html);

    act(() => {
      fireEvent.change(html.baseElement.querySelector<HTMLDivElement>('input.ant-input')!, {
        target: {
          value: 'ProComponents',
        },
      });
    });

    await waitForComponentToPaint(html);

    expect(html.baseElement.querySelector<HTMLDivElement>('div#show')?.textContent).toBe(
      'ProComponents',
    );
  });

  it('⛲ shouldUpdate of ProFormDependency is Function', async () => {
    const html = render(
      <ProForm>
        <ProFormText name="name" label="姓名" />
        <ProFormDependency
          name={['name']}
          shouldUpdate={(prevValues, nextValues) => {
            if (nextValues.name === 'update') {
              return true;
            }
            return false;
          }}
        >
          {({ name }) => {
            return <div id="show">{name || 'first'}</div>;
          }}
        </ProFormDependency>
      </ProForm>,
    );

    act(() => {
      fireEvent.change(html.baseElement.querySelector<HTMLDivElement>('input.ant-input')!, {
        target: {
          value: "Don't update",
        },
      });
    });

    await waitForComponentToPaint(html);

    act(() => {
      fireEvent.change(html.baseElement.querySelector<HTMLDivElement>('input.ant-input')!, {
        target: {
          value: 'update',
        },
      });
    });

    await waitForComponentToPaint(html);

    expect(html.baseElement.querySelector<HTMLDivElement>('div#show')?.textContent).toBe('update');
  });

  it('⛲ ProFormDependency support transform', async () => {
    const dependencyFn = jest.fn();
    const Demo: React.FC<{
      shouldUpdate?: boolean;
    }> = () => {
      return (
        <ProForm>
          <ProFormText
            name="name"
            label="姓名"
            transform={(value) => {
              return {
                name: value,
                nickName: 'chen',
              };
            }}
          />
          <ProFormDependency name={['name', 'nickName']}>
            {({ name, nickName }) => {
              dependencyFn(name + ' ' + nickName);
              return <div id="show">{name || 'first'}</div>;
            }}
          </ProFormDependency>
        </ProForm>
      );
    };

    const html = render(<Demo />);

    act(() => {
      fireEvent.change(html.baseElement.querySelector<HTMLDivElement>('input.ant-input')!, {
        target: {
          value: 'second',
        },
      });
    });

    await waitForComponentToPaint(html);
    expect(dependencyFn).toBeCalledWith('second chen');
  });
});