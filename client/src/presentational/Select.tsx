import classNames from 'classnames';
import React from 'react';
import type {ItemProps, SelectProps} from 'react-aria-components';
import {Button, Label, ListBox, Popover, Select as RACSelect, SelectValue, Text, Item as RACItem} from 'react-aria-components';

interface MySelectProps<T extends object>
  extends Omit<SelectProps<T>, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string;
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<T extends object>(
  { label, description, errorMessage, children, items, ...props }:
    MySelectProps<T>
) {
  return (
    <RACSelect className="flex flex-col items-stretch flex-auto" {...props}>
      <Label className='pl-2 text-sm m-0'>{label}</Label>
      <Button className={classNames('text-left p-2 rounded-md bg-input text-text w-full border-2 border-primary flex')}>
        <SelectValue className='flex-auto' />
        <span aria-hidden="true">▼</span>
      </Button>
      {description && <Text slot="description">{description}</Text>}
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
      <Popover className='bg-input p-2 rounded-md shadow w-[var(--trigger-width)]'>
        <ListBox className="flex flex-col items-stretch gap-1 w-full">
          {children}
        </ListBox>
      </Popover>
    </RACSelect>
  );
}

export function Item({ className, ...props}: ItemProps) {
  return <RACItem {...props} className={classNames(className, "p-2 rounded hover:bg-lightbg text-text")} />
}