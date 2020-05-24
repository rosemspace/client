1. tag open state /`<`/
    1. `!`
    **switch** to the markup declaration open state
    2. `/`
    **switch** to the end tag open state
    3. `ASCII alpha`
    **reconsume** in the tag name state (2.4, 2.7)
    4. `?` _unexpected-question-mark-instead-of-tag-name parse error_
    **reconsume** in the bogus comment state
    5. `EOF` _eof-before-tag-name parse error_
    **emit** `<` char token
    **emit** `EOF` token
    6. anything else _invalid-first-character-of-tag-name parse error_
    **reconsume** in the data state
2. tag name state /`ASCII alpha` (1.3)/
    1. `\s`
    **switch** to the before attribute name state
    2. `/`
    **switch** to the self-closing start tag state
    3. `>`
    **emit** the current tag token
    **switch** to the data state
    4. `ASCII upper alpha`
    **convert** to the lowercase
    5. `\u0000` _unexpected-null-character parse error_
    **replace** by `�`
    6. `EOF` _eof-in-tag parse error_
    **emit** `EOF` token
    7. anything else
    **add** to the tag name
3. before attribute name state /`\s` (2.1)/
    1. `\s`
    **ignore**
    2. `/` or `>` or `EOF`
    **reconsume** in the after attribute name state
    3. `=` _unexpected-equals-sign-before-attribute-name parse error_
    **add** to the attribute name
    **switch** to the attribute name state
    4. anything else
    **reconsume** in the attribute name state
4. attribute name state /`=` (3.3), anything else (3.4, 5.6)/
    1. `\s` or `/` or `>` or `EOF`
    **reconsume** in the after attribute name state
    2. `=`
    **switch** to the before attribute value state
    3. `ASCII upper alpha`
    **convert** to the lowercase
    4. `\u0000` _unexpected-null-character parse error_
    **replace** by `�`
    5. `"` or `'` or `<` _unexpected-character-in-attribute-name parse error_
    **add** to the attribute name
    6. anything else
    **add** to the attribute name
5. after attribute name state
    1. `\s`
    **ignore**
    2. `/`
    **switch** to the self-closing start tag state
    3. `=`
    **switch** to the before attribute value state
    4. `>`
    **emit** the current tag token
    **switch** to the data state
    5. `EOF` _eof-in-tag parse error_
    **emit** `EOF` token
    6. anything else
    **reconsume** in the attribute name state
6. before attribute value state
    1. `\s`
    **ignore**
    2. `"`
    **switch** to the attribute value (double-quoted) state
7. attribute value (double-quoted) state
8. attribute value (single-quoted) state
9. attribute value (unquoted) state
10. after attribute value (quoted) state
11. self-closing start tag state /`/` (2.2, 5.2)/

```
<!?Az="'` />$
```
1. `<_` invalid-first-character-of-tag-name parse error
2. `<` eof-before-tag-name parse error
3. `<?` unexpected-question-mark-instead-of-tag-name parse error
4. `<taG` eof-in-tag parse error
    1. `<Uex\0` unexpected-null-character parse error
    2. `<eND>`
5. `</` eof-before-tag-name parse error
    1. `</_` invalid-first-character-of-tag-name parse error
    2. `</>` missing-end-tag-name parse error
6. `<!`
```phpregexpextended
# https://html.spec.whatwg.org/multipage/parsing.html#tag-open-state
< # tag open state
(?:
    # next char not:
    # 1. `!` - markup declaration open state
    # 2. `/` - end tag open state
    # 3. `?` - unexpected-question-mark-instead-of-tag-name parse error -> reconsume in the bogus comment state
    # 4. !EOF and /[^!\/?A-Za-z]/ - invalid-first-character-of-tag-name parse error -> reconsume in the data state
    (?:
        # `\x00` - unexpected-null-character parse error -> replace by `�`
        [A-Za-z][^\s\/>]* # tag name state (includes /[A-Za-z]/ and `\x00`)
        (?:
            (?:
                # unexpected-solidus-in-tag parse error -> reconsume in the before attribute name state (not `/` or not `/>`)
                \/?
                # empty - missing-whitespace-between-attributes parse error
                \s*? # before attribute name state
                (?:
                    # `=` - unexpected-equals-sign-before-attribute-name parse error
                    # `\x00` - unexpected-null-character parse error -> replace by `�`
                    # `"`, `'`, `<` - unexpected-character-in-attribute-name parse error
                    (?:=|[^\s\/>])[^\s\/>=]* # attrbiute name state
                    (?:
                        = # before attribute value state
                        (?:\s*(?: # ignore spaces
                            # todo entity reference &
                            " #attribute value (double-quoted) state
                            (?:
                                # `\x00` - unexpected-null-character parse error -> replace by `�`
                                [^"]*
                                "? # after attribute value (quoted) state
                            )
                            |' # attribute value (single-quoted) state
                            (?:
                                # `\x00` - unexpected-null-character parse error -> replace by `�`
                                [^']*
                                '? # after attribute value (quoted) state
                            )
                            #REMOVE|> # missing-attribute-value parse error -> emit current tag token -> data state
                            # `\x00` - unexpected-null-character parse error -> replace by `�`
                            # `"`, `'`, `<`, `=`, ``` - unexpected-character-in-unquoted-attribute-value parse error
                            |[^>][^\s>]* # attribute value (unquoted) state
                        )?) # missing-attribute-value parse error
                    )? # attrbiute can be declared without value (as boolean)
                )? # there can be just spaces
            )*? # there can be zero or several attributes
            \/? #self-closing start tag state
            (?: # previous char sequense is /\s*=/ - missing-attribute-value parse error
                > # emit current tag token -> data state
                |$ # eof-in-tag parse error -> emit EOF token
            )
        )
    )
    |$ # eof-before-tag-name parse error -> emit `<` char and EOF token
)
```

# Short version
```phpregexpextended
<(?:(?:[A-Za-z][^\s\/>]*(?:(?:\s*(?:(?:=|[^\s\/>])[^\s\/>=]*(?:=(?:\s*(?:"(?:[^"]*"?)|'(?:[^']*'?)|[^>][^\s>]*)?))?)?)*?(?:\/(?:|$)|>))|$)|$)
```
