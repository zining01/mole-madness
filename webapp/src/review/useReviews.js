// A signed-in reviewer's saved reviews of the review set, keyed by case id, and
// saving one. See case_reviews in supabase/schema.sql.
import { useEffect, useState } from 'react';
import { useAccount } from '../auth/account.js';
import { reviewSet } from './reviewSet.js';

export function useReviews() {
  const { client } = useAccount();
  const [reviews, setReviews] = useState(null); // null while loading
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!client) return;
    let live = true;
    client.from('case_reviews').select('case_id, present, unassessable, blind, comment').eq('review_set', reviewSet.name)
      .then(({ data, error }) => {
        if (!live) return;
        if (error) setLoadError('Your reviews could not be loaded. Please refresh the page.');
        else setReviews(Object.fromEntries(data.map((r) => [r.case_id, r])));
      });
    return () => {
      live = false;
    };
  }, [client]);

  /** Saves one review; resolves to an error message, or null on success. */
  const save = async (review) => {
    const { error } = await client.from('case_reviews')
      .upsert({ review_set: reviewSet.name, ...review }, { onConflict: 'user_id,case_id' });
    if (!error) {
      setReviews((prev) => ({ ...prev, [review.case_id]: review }));
      return null;
    }
    return error.code === '42501'
      ? "Your account isn't on the reviewer list any more, so this wasn't saved."
      : `Not saved: ${error.message}`;
  };

  return { reviews, loadError, save };
}
