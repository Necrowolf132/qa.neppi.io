import React,  { useEffect, useState, useRef, useContext } from 'react';
import { Sync } from '@buffetjs/icons';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { InputText } from '@buffetjs/core';
import { colors } from '@buffetjs/styles';
import RightContentLabel from './RightContentLabel';
import { useDebounce, useClickAwayListener } from '@buffetjs/hooks';
import { request, LoadingIndicator, useGlobalContext, useStrapi } from 'strapi-helper-plugin';
//import useDataManager from '../../hooks/useDataManager';
import getRequestUrl from '../../utils/getRequestUrl';
import { Label, Error } from '@buffetjs/core';
import RegenerateButton from './RegenerateButton';
import RightContent from './RightContent';
import { FormattedMessage } from 'react-intl';
import Wrapper from './Wrapper';
import RightLabel from './RightLabel';
import getTrad from '../../utils/getTrad';
//import EditViewDataManagerContext from 'strapi-plugin-content-manager/admin/src/contexts/EditViewDataManager.js'
import UID_REGEX from './regex';

const Name = styled(Label)`
  display: block;
  text-transform: capitalize;
  margin-bottom: 1rem;
`;

const InputToken = styled(InputText)`
  width: 100%;

  ${({ containsEndAdornment }) =>
    containsEndAdornment &&
    `
      > input {
        padding-right: calc(40px + 1rem);
      }
    `}

  ${({ error }) =>
    error &&
    `
      > input {
        border-color: ${colors.darkOrange};
      }
    `}
`;

const InputContainer = styled.div`
  position: relative;
`;

const TokenGenerator = ({
  
    attribute,
    contentTypeUID,
    description,
    error: inputError,
    name,
    onChange,
    validations,
    value,
    editable,
    ...inputProps
    
}) => {
  // Check out the provided props
      const {
        strapi: { fieldApi },
      } = useStrapi();
      const [isLoading, setIsLoading] = useState(false);
     // const { modifiedData, initialData, layout } = useDataManager();
      const [label, setLabel] = useState();
     // const isCreation = !initialData[createdAtName];
      const wrapperRef = useRef(null);
      const generateUid = useRef();
      const [availability, setAvailability] = useState(null);
      const { formatMessage } = useGlobalContext();
     // const debouncedTargetFieldValue = useDebounce(modifiedData[attribute.targetField], 300);

      generateUid.current = async (shouldSetInitialValue = false) => {
        setIsLoading(true);
        const requestURL = getRequestUrl('generateToken');
        try {
          const { token } = await request(requestURL, {
            method: 'POST',
            body: {
              tableConfirm: attribute.targetTable,
              field: attribute.targetField
            },
          });
          onChange({ target: { name, value: token, type: 'text' } }, shouldSetInitialValue);
          setIsLoading(false);
        } catch (err) {
          console.error({ err });
          setIsLoading(false);
        }
      };
     /* useEffect(() => {
        if (
          !isCustomized &&
          isCreation &&
          debouncedTargetFieldValue &&
          modifiedData[attribute.targetField]
        ) {
          generateUid.current(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [debouncedTargetFieldValue, isCustomized, isCreation]);*/
    
      const handleFocus = () => {
        if (availability && availability.suggestion) {
          setIsSuggestionOpen(true);
        }
      };

      const handleGenerateMouseEnter = () => {
      setLabel('regenerate');
      };

      const handleGenerateMouseLeave = () => {
      setLabel(null);
      };
      const handleChange = (e, canCheck, dispatch) => {
        if (!canCheck) {
          dispatch({
            type: 'SET_CHECK',
          });
        }
    
        dispatch({
          type: 'SET_ERROR',
          error: null,
        });
        if (e.target.value ) {
         // setIsCustomized(true);
        }
    
        onChange(e);
      };

  return(
    <Error
      name={name}
      inputError={inputError}
      type="text"
      validations={{ ...validations, regex: UID_REGEX }}
    > 
  {({ canCheck, onBlur, error, dispatch }) => {

    const hasError = Boolean(error);
    if(attribute.targetTable && attribute.targetField){
    return (
      <Wrapper ref={wrapperRef}>
      <Name htmlFor={attribute.nameLabel ? attribute.nameLabel: name}>{attribute.nameLabel ? attribute.nameLabel: name}</Name>
     <InputContainer>

    <InputToken 
          { ...inputProps}
          containsEndAdornment={editable}
          editable={editable}
          error={hasError}
          onFocus={handleFocus}
          readOnly={true}
          name={name}
          onChange={e => handleChange(e, canCheck, dispatch)}
          type="text"
          onBlur={onBlur}
          // eslint-disable-next-line no-irregular-whitespace
          value={value || ''}
     />

              <RightContent>
                {label && (
                  <RightContentLabel color="blue">
                    {formatMessage({
                      id: getTrad('label.principal.generar'),
                    })}
                  </RightContentLabel>
                )}
                {!isLoading && !label && availability && (
                  <RightLabel
                    isAvailable={availability.isAvailable || value === availability.suggestion}
                  />
                )}
                {editable && (
                  <RegenerateButton
                    onMouseEnter={handleGenerateMouseEnter}
                    onMouseLeave={handleGenerateMouseLeave}
                    onClick={() => generateUid.current()}
                  >
                    {isLoading ? (
                      <LoadingIndicator small />
                    ) : (
                      <Sync fill={label ? '#007EFF' : '#B5B7BB'} width="11px" height="11px" />
                    )}
                  </RegenerateButton>
                )}
              </RightContent>
              {availability && availability.suggestion && isSuggestionOpen && (
                <FormattedMessage id={getTrad("label.principal.disponible")}>
                  {msg => (
                    <Options
                      title={msg}
                      options={[
                        {
                          id: 'suggestion',
                          label: availability.suggestion,
                          onClick: handleSuggestionClick,
                        },
                      ]}
                    />
                  )}
                </FormattedMessage>
              )}
            </InputContainer>
      </Wrapper>
      );
    } else {
      return (
        <Wrapper ref={wrapperRef}>
        <Name htmlFor={attribute.nameLabel ? attribute.nameLabel: name}>{attribute.nameLabel ? attribute.nameLabel: name}</Name>
       <InputContainer>
         <Name htmlFor={"Error en el input campo 'targetTable' o 'targetField' no configurado, ambos son necesarios"}>{"Error en el input campo 'targetTable' o 'targetField' no configurado, ambos son necesarios"}</Name>
              </InputContainer>
        </Wrapper>
        );
    }
    }}
  </Error>
  );
};
TokenGenerator.propTypes = {
  attribute: PropTypes.object.isRequired,
  contentTypeUID: PropTypes.string.isRequired,
  description: PropTypes.string,
  editable: PropTypes.bool,
  error: PropTypes.string,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  validations: PropTypes.object,
  value: PropTypes.string,
};

TokenGenerator.defaultProps = {
  attribute: 'token',
  description: '',
  editable: false,
  error: null,
  validations: {},
  value: '',
};
export default TokenGenerator;  