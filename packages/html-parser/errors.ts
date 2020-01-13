export const enum ErrorCode {
  ABRUPT_CLOSING_OF_EMPTY_COMMENT,
  ABSENCE_OF_DIGITS_IN_NUMERIC_CHARACTER_REFERENCE,
  CDATA_IN_HTML_CONTENT,
  CHARACTER_REFERENCE_OUTSIDE_UNICODE_RANGE,
  CONTROL_CHARACTER_REFERENCE,
  CONTROL_CHARACTER_IN_INPUT_STREAM,
  DUPLICATE_ATTRIBUTE,
  END_TAG_WITH_ATTRIBUTES,
  END_TAG_WITH_TRAILING_SOLIDUS,
  EOF_BEFORE_TAG_NAME,
  EOF_IN_CDATA,
  EOF_IN_COMMENT,
  EOF_IN_SCRIPT_HTML_COMMENT_LIKE_TEXT,
  EOF_IN_TAG,
  INCORRECTLY_CLOSED_COMMENT,
  INCORRECTLY_OPENED_COMMENT,
  INVALID_FIRST_CHARACTER_OF_TAG_NAME,
  MISSING_ATTRIBUTE_VALUE,
  MISSING_END_TAG_NAME,
  MISSING_SEMICOLON_AFTER_CHARACTER_REFERENCE,
  MISSING_WHITESPACE_BETWEEN_ATTRIBUTES,
  NESTED_COMMENT,
  NONCHARACTER_CHARACTER_REFERENCE,
  NONCHARACTER_IN_INPUT_STREAM,
  NULL_CHARACTER_REFERENCE,
  SURROGATE_CHARACTER_REFERENCE,
  SURROGATE_IN_INPUT_STREAM,
  UNEXPECTED_CHARACTER_IN_ATTRIBUTE_NAME,
  UNEXPECTED_CHARACTER_IN_UNQUOTED_ATTRIBUTE_VALUE,
  UNEXPECTED_EQUALS_SIGN_BEFORE_ATTRIBUTE_NAME,
  UNEXPECTED_NULL_CHARACTER,
  UNEXPECTED_QUESTION_MARK_INSTEAD_OF_TAG_NAME,
  UNEXPECTED_SOLIDUS_IN_TAG,
  UNKNOWN_NAMED_CHARACTER_REFERENCE,
  // Special value for higher-order compilers to pick up the last code
  // to avoid collision of error codes. This should always be kept as the last
  // item.
  __EXTEND_POINT__,
}

export const errorMessages: { [code: number]: string } = {
  [ErrorCode.ABRUPT_CLOSING_OF_EMPTY_COMMENT]: 'Illegal comment.',
  [ErrorCode.ABSENCE_OF_DIGITS_IN_NUMERIC_CHARACTER_REFERENCE]:
    'Illegal numeric character reference: invalid character.',
  [ErrorCode.CDATA_IN_HTML_CONTENT]:
    'CDATA section is allowed only in XML context.',
  [ErrorCode.CHARACTER_REFERENCE_OUTSIDE_UNICODE_RANGE]:
    'Illegal numeric character reference: too big.',
  [ErrorCode.CONTROL_CHARACTER_REFERENCE]:
    'Illegal numeric character reference: control character.',
  [ErrorCode.CONTROL_CHARACTER_IN_INPUT_STREAM]:
    'Control character in input stream',
  [ErrorCode.DUPLICATE_ATTRIBUTE]: 'Duplicate attribute.',
  [ErrorCode.END_TAG_WITH_ATTRIBUTES]: 'End tag cannot have attributes.',
  [ErrorCode.END_TAG_WITH_TRAILING_SOLIDUS]: "Illegal '/' in tags.",
  [ErrorCode.EOF_BEFORE_TAG_NAME]: 'Unexpected EOF in tag.',
  [ErrorCode.EOF_IN_CDATA]: 'Unexpected EOF in CDATA section.',
  [ErrorCode.EOF_IN_COMMENT]: 'Unexpected EOF in comment.',
  [ErrorCode.EOF_IN_SCRIPT_HTML_COMMENT_LIKE_TEXT]: 'Unexpected EOF in script.',
  [ErrorCode.EOF_IN_TAG]: 'Unexpected EOF in tag.',
  [ErrorCode.INCORRECTLY_CLOSED_COMMENT]: 'Incorrectly closed comment.',
  [ErrorCode.INCORRECTLY_OPENED_COMMENT]: 'Incorrectly opened comment.',
  [ErrorCode.INVALID_FIRST_CHARACTER_OF_TAG_NAME]:
    "Illegal tag name. Use '&lt;' to print '<'.",
  [ErrorCode.MISSING_ATTRIBUTE_VALUE]: 'Attribute value was expected.',
  [ErrorCode.MISSING_END_TAG_NAME]: 'End tag name was expected.',
  [ErrorCode.MISSING_SEMICOLON_AFTER_CHARACTER_REFERENCE]:
    'Semicolon was expected.',
  [ErrorCode.MISSING_WHITESPACE_BETWEEN_ATTRIBUTES]: 'Whitespace was expected.',
  [ErrorCode.NESTED_COMMENT]: "Unexpected '<!--' in comment.",
  [ErrorCode.NONCHARACTER_CHARACTER_REFERENCE]:
    'Illegal numeric character reference: non character.',
  [ErrorCode.NONCHARACTER_IN_INPUT_STREAM]: 'Non character in input stream.',
  [ErrorCode.NULL_CHARACTER_REFERENCE]:
    'Illegal numeric character reference: null character.',
  [ErrorCode.SURROGATE_CHARACTER_REFERENCE]:
    'Illegal numeric character reference: non-pair surrogate.',
  [ErrorCode.SURROGATE_IN_INPUT_STREAM]: 'Non-pair surrogate in input stream.',
  [ErrorCode.UNEXPECTED_CHARACTER_IN_ATTRIBUTE_NAME]: `Attribute name cannot contain U+0022 ("), U+0027 ('), and U+003C (<).`,
  [ErrorCode.UNEXPECTED_CHARACTER_IN_UNQUOTED_ATTRIBUTE_VALUE]:
    'Unquoted attribute value cannot contain U+0022 ("), U+0027 (\'), U+003C (<), U+003D (=), and U+0060 (`).',
  [ErrorCode.UNEXPECTED_EQUALS_SIGN_BEFORE_ATTRIBUTE_NAME]:
    "Attribute name cannot start with '='.",
  [ErrorCode.UNEXPECTED_QUESTION_MARK_INSTEAD_OF_TAG_NAME]:
    "'<?' is allowed only in XML context.",
  [ErrorCode.UNEXPECTED_SOLIDUS_IN_TAG]: "Illegal '/' in tags.",
  [ErrorCode.UNKNOWN_NAMED_CHARACTER_REFERENCE]: 'Unknown entity name.',
}
