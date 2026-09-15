package com.university.hometutor.searchandfilter;

import com.university.hometutor.tutormanagement.TutorProfile;
import java.util.List;

public class MergeSort {

    public static void sortByHourlyRate(List<TutorProfile> profiles) {
        if (profiles.size() < 2) {
            return;
        }
        int mid = profiles.size() / 2;
        List<TutorProfile> left = profiles.subList(0, mid);
        List<TutorProfile> right = profiles.subList(mid, profiles.size());

        // Create new lists to prevent ConcurrentModificationException when clearing
        // original
        left = new java.util.ArrayList<>(left);
        right = new java.util.ArrayList<>(right);

        sortByHourlyRate(left);
        sortByHourlyRate(right);

        mergeByHourlyRate(profiles, left, right);
    }

    private static void mergeByHourlyRate(List<TutorProfile> result, List<TutorProfile> left,
            List<TutorProfile> right) {
        int i = 0, j = 0, k = 0;

        while (i < left.size() && j < right.size()) {
            if (left.get(i).getHourlyRate() <= right.get(j).getHourlyRate()) {
                result.set(k++, left.get(i++));
            } else {
                result.set(k++, right.get(j++));
            }
        }

        while (i < left.size()) {
            result.set(k++, left.get(i++));
        }

        while (j < right.size()) {
            result.set(k++, right.get(j++));
        }
    }
}
