import React, { useState, useEffect } from 'react';
import { TextWithHighlights } from '@aws-sdk/client-kendra';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { QueryResultItem } from '@aws-sdk/client-kendra';
import HighlightText from './HighlightText';

interface TypeQuestionAnswerProps {
  item: QueryResultItem;
}

function TypeQuestionAnswer(props: TypeQuestionAnswerProps) {
  const [answerTextHighlights, setAnswerTextHighlights] =
    useState<TextWithHighlights>({ Text: '', Highlights: [] });
  const [questionTextHighlights, setQuestionTextHighlights] =
    useState<TextWithHighlights>({ Text: '', Highlights: [] });
  const [documentUri, setDocumentUri] = useState('');

  useEffect(() => {
    setDocumentUri(props.item.DocumentURI || '');

    const answerText = props.item.AdditionalAttributes?.find(
      (a) => a.Key === 'AnswerText'
    );
    setAnswerTextHighlights(
      answerText?.Value?.TextWithHighlightsValue || { Text: '', Highlights: [] }
    );

    const questionText = props.item.AdditionalAttributes?.find(
      (a) => a.Key === 'QuestionText'
    );
    setQuestionTextHighlights(
      questionText?.Value?.TextWithHighlightsValue || {
        Text: '',
        Highlights: [],
      }
    );
  }, [props]);

  return (
    <div className="p-4 w-2/3 mb-3">
      <div className="text-xs text-gray-400 flex items-center mb-1 ml-1">
        <FontAwesomeIcon className="mr-2" icon={faQuestion} />
        <div>よくある質問</div>
      </div>
      <div className="text-2xl mb-1">
        <HighlightText textWithHighlights={answerTextHighlights} />
      </div>
      <div className="flex items-end">
        <div className="mr-auto text-sm">
          <HighlightText textWithHighlights={questionTextHighlights} />
        </div>
        <div className="ml-auto text-xs text-sky-400">
          <a href={documentUri} target="_blank" rel="noreferrer">
            {documentUri}
          </a>
        </div>
      </div>
    </div>
  );
}

export default TypeQuestionAnswer;
