/**
 *
 * DateTime
 *
 */

import React, { useState, useEffect, useMemo} from 'react';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import { isEmpty, cloneDeep } from 'lodash';
import { DatePicker, TimePicker, Error, Label} from '@buffetjs/core';
import Wrapper2 from './Wrapper2';
import Wrapper, { IconWrapper } from './Wrapper';
import { Description, ErrorMessage, Tooltip } from '@buffetjs/styles';

const UNITS = ['hour', 'minute', 'second'];
export const getTimeString = time => {
  if (!time) {
    return '';
  }

  const currTime = time || moment().tz("America/Caracas");

  const timeObj = getTimeObject(currTime);
  const timeString = Object.keys(timeObj)
    .map(key => (timeObj[key] < 10 ? `0${timeObj[key]}` : timeObj[key]))
    .join(':');

  return timeString;
};
export const getTimeObject = time => {
  const timeObj = {};

  UNITS.forEach(unit => {
    timeObj[unit] = time.get(unit);
  });

  return timeObj;
};

function DateTime({
  disabled,
  translatedErrors,
  name,
  description,
  id,
  onChange,
  value,
  tabIndex,
  step,
  type,
  validations,
  label,
  error: inputError,
  ...rest
}) {
  const [timestamp, setTimestamp] = useState(null);

  const setData = time => {
    const [hour, minute, second] = time.split(':');
    const timeObj = {
      hour,
      minute,
      second,
    };

    const currentDate = isEmpty(timestamp) ? moment() : cloneDeep(timestamp);
    currentDate.set('hours', timeObj.hour);
    currentDate.set('minute', timeObj.minute);
    currentDate.set('second', timeObj.second);

    setDate(currentDate);
  };
  const setDate = (date, time) => {
    // Clearing the date
    if (date === null) {
      setTimestamp(null);

      onChange({ target: { name, type: 'datetime', value: null } });

      return;
    }

    const newDate = time || date;
    date.set(getTimeObject(newDate));
    date.toISOString();
    date.format();

    setTimestamp(date);

    onChange({ target: { name, type: 'datetime', value: date } });
  };

  useEffect(() => {
    if (!!value && moment(value).isValid()) {
      const newDate = value._isAMomentObject === true ? value : moment(value);

      setTimestamp(newDate);
    }
  }, [value]);
  const inputId = useMemo(() => id || name, [id, name]);
  const descriptionId = `description-${inputId}`;
  const errorId = `error-${inputId}`;

  return (
    <Error
    inputError={inputError}
    name={name}
    translatedErrors={translatedErrors}
    type={type}
    validations={validations}
    >
     {({ canCheck, onBlur, error, dispatch }) => (
        <Wrapper error={error}>
          {type !== 'checkbox' && (
            <Label htmlFor={inputId}>
              <span>
                {label}
                {isEmpty(label) && <>&nbsp;</>}
              </span>
              {rest.labelIcon && (
                <>
                  <IconWrapper
                    data-tip={rest.labelIcon.title}
                    data-for="icon-title"
                    onMouseEnter={handleMouseEvent}
                    onMouseLeave={handleMouseEvent}
                  >
                    {rest.labelIcon.icon}
                  </IconWrapper>
                  {isOver && <Tooltip id="icon-title" />}
                </>
              )}
            </Label>
          )}
      <Wrapper2>
        <DatePicker
          {...rest}
          name="datetime"
          disabled={disabled}
          onChange={({ target }) => {
            setDate(target.value, timestamp);
          }}
          tabIndex={tabIndex}
          value={timestamp}
        />
        <TimePicker
          name="time"
          disabled={disabled}
          onChange={({ target }) => {
            console.log(target.value)
            setData(target.value);
          }}
          seconds={true}
          tabIndex={tabIndex}
          value={getTimeString(timestamp) || ''}
          step={step}
        />
      </Wrapper2>
      {!error && description && (
        <Description id={descriptionId} title={description}>
          {description}
        </Description>
      )}
      {error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
    </Wrapper>
  )}
  </Error> 
  );
}

DateTime.defaultProps = {
  autoFocus: false,
  disabled: false,
  description: null,
  id: null,
  onChange: () => {},
  placeholder: null,
  tabIndex: '0',
  value: null,
  label: null,
  labelIcon: null,
  translatedErrors: {
    date: 'This is not a date',
    email: 'This is not an email',
    string: 'This is not a string',
    number: 'This is not a number',
    json: 'This is not a JSON',
    max: 'This is too high',
    maxLength: 'This is too long',
    min: 'This is too small',
    minLength: 'This is too short',
    required: 'This value is required',
    regex: 'This does not match the format',
    uppercase: 'This must be a upper case string',
  },
  validations: {},
  withDefaultValue: false,
  step: 30,
};

DateTime.propTypes = {
  autoFocus: PropTypes.bool,
  disabled: PropTypes.bool,
  description: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  step: PropTypes.number,
  label: PropTypes.string,
  labelIcon: PropTypes.shape({ icon: PropTypes.any, title: PropTypes.string }),
  tabIndex: PropTypes.string,
  value: PropTypes.oneOfType([
    momentPropTypes.momentObj,
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  validations: PropTypes.object,
  type: PropTypes.string.isRequired,
  translatedErrors: PropTypes.objectOf(PropTypes.string),
  withDefaultValue: PropTypes.bool,
};

export default DateTime;
