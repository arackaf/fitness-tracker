export type PaginationPayload<TResult, TPaginationToken> = {
  results: TResult[];
  nextPageToken?: TPaginationToken | null;
  previousPageToken?: TPaginationToken | null;
};

export type PaginationTokens<TPaginationToken> = {
  nextPage?: TPaginationToken | null;
  previousPage?: TPaginationToken | null;
};

export function getPaginationResults<TResult, TPaginationToken>(
  rawResults: TResult[],
  currentPagination: PaginationTokens<TPaginationToken>,
  rowToToken: (row: TResult) => TPaginationToken,
  pageSize: number,
): PaginationPayload<TResult, TPaginationToken> {
  let nextPageToken: TPaginationToken | null | undefined;
  let previousPageToken: TPaginationToken | null | undefined;

  let adjustedResults = currentPagination.previousPage ? [...rawResults].reverse() : [...rawResults];

  if (currentPagination.previousPage) {
    previousPageToken = adjustedResults.length > pageSize ? rowToToken(adjustedResults[1]) : null;

    nextPageToken = currentPagination.previousPage;
  } else {
    if (currentPagination.nextPage) {
      previousPageToken = currentPagination.nextPage;
    }
    nextPageToken = rowToToken(adjustedResults[pageSize]);
  }

  if (adjustedResults.length > pageSize) {
    if (currentPagination.previousPage) {
      adjustedResults = adjustedResults.slice(1);
    } else {
      adjustedResults = adjustedResults.slice(0, pageSize);
    }
  }

  return {
    results: adjustedResults,
    nextPageToken,
    previousPageToken,
  };
}
