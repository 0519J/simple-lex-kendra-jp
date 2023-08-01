import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faXmark,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import TypeDocument from './TypeDocument';
import TypeAnswer from './TypeAnswer';
import TypeQuestionAnswer from './TypeQuestionAnswer';
import TypeNotFound from './TypeNotFound';
import {
  FeaturedResultsItem,
  QueryResultItem,
  FacetResult,
} from '@aws-sdk/client-kendra';
import { useForm } from 'react-hook-form';
import './ItemList.css';
import useQuery from '../lib/useQuery';
import FilterResult, { FilterType } from './FilterResult';

interface Query {
  query: string;
}

function ItemList() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<QueryResultItem[]>([]);
  const [featuredResults, setFeaturedResults] = useState<FeaturedResultsItem[]>(
    []
  );
  const [facets, setFacets] = useState<FacetResult[]>([]);
  const [filters, setFilters] = useState<FilterType[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryOnce, setQueryOnce] = useState(false);

  const { register, watch, handleSubmit, setValue } = useForm<Query>();

  const watchQuery = watch('query', '');

  // [Auth 拡張実装] アクセストークン設定の処理があるため、useQueryを新設
  const { send } = useQuery();

  useEffect(() => {
    if (query) {
      setQueryOnce(true);
      setLoading(true);
      setItems([]);
      setFeaturedResults([]);
      send(query, filters).then((result) => {
        setItems(result?.ResultItems ?? []);
        setFacets(result?.FacetResults ?? []);
        setFeaturedResults(result?.FeaturedResultsItems ?? []);
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, query]);

  const onSubmit = async (data: Query) => {
    if (data.query.length === 0) return;
    // 検索ワードを書き換えたら、絞り込み条件を初期化
    if (query !== data.query) {
      setFilters([]);
      setFacets([]);
    }
    setQuery(data.query);
  };

  const onChangeFilters = (newFileters: FilterType[]) => {
    setFilters(newFileters);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl my-6 text-gray-600">Kendra Auth 検索サンプル</h1>

      <form
        className="flex items-center border border-gray-400 rounded-full py-2 px-2 w-1/2 mb-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FontAwesomeIcon
          className="text-sm text-gray-400 ml-1 mr-2"
          icon={faSearch}
        />
        <input
          className="focus:outline-none w-full"
          type="text"
          {...register('query')}
        />

        {watchQuery.length > 0 && (
          <FontAwesomeIcon
            className="text-sm text-gray-400 mr-1 ml-2 cursor-pointer"
            icon={faXmark}
            onClick={() => {
              setValue('query', '');
            }}
          />
        )}
      </form>

      <div className="w-full border border-b-0 border-gray-400 mb-4" />
      {queryOnce &&
        !loading &&
        items.length === 0 &&
        featuredResults.length === 0 && <TypeNotFound />}

      <div className="grid grid-cols-10 w-full">
        <div className="mx-5 col-span-2">
          {queryOnce && facets.length > 0 && (
            <FilterResult
              filters={filters}
              facetResults={facets}
              onChange={onChangeFilters}
            />
          )}
        </div>

        <div className="col-start-3 col-span-6">
          {loading && (
            <div className="flex justify-center">
              <FontAwesomeIcon
                className="text-xl text-gray-400 rotate mt-4"
                icon={faSpinner}
              />
            </div>
          )}
          {/* 通常の検索結果より先に、FeaturedResultsを表示する */}
          {!loading &&
            featuredResults.map((item) => {
              return (
                <TypeDocument item={item} isFeatured={true} key={item.Id} />
              );
            })}

          {!loading &&
            items.length > 0 &&
            items.map((item: QueryResultItem) => {
              switch (item.Type) {
                case 'DOCUMENT':
                  return <TypeDocument item={item} key={item.Id} />;
                case 'ANSWER':
                  return <TypeAnswer item={item} key={item.Id} />;
                case 'QUESTION_ANSWER':
                  return <TypeQuestionAnswer item={item} key={item.Id} />;
                default:
                  return <>Unknown Type: {item.Type}</>;
              }
            })}
        </div>
      </div>
    </div>
  );
}

export default ItemList;
