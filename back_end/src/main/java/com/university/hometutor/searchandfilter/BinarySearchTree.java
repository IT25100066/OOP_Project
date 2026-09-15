package com.university.hometutor.searchandfilter;

import com.university.hometutor.tutormanagement.TutorProfile;
import java.util.ArrayList;
import java.util.List;

public class BinarySearchTree {

    class Node {
        TutorProfile profile;
        Node left, right;

        public Node(TutorProfile profile) {
            this.profile = profile;
            left = right = null;
        }
    }

    Node root;

    public BinarySearchTree() {
        root = null;
    }

    public void insert(TutorProfile profile) {
        root = insertRec(root, profile);
    }

    private Node insertRec(Node root, TutorProfile profile) {
        if (root == null) {
            root = new Node(profile);
            return root;
        }

        // Using average rating for BST organization
        double key1 = profile.getAverageRating() != null ? profile.getAverageRating() : 0.0;
        double key2 = root.profile.getAverageRating() != null ? root.profile.getAverageRating() : 0.0;

        // If ratings are equal, use ID to ensure all records insert successfully
        // without overwriting
        if (key1 < key2) {
            root.left = insertRec(root.left, profile);
        } else if (key1 > key2) {
            root.right = insertRec(root.right, profile);
        } else {
            if (profile.getId() != null && root.profile.getId() != null && profile.getId() < root.profile.getId()) {
                root.left = insertRec(root.left, profile);
            } else {
                root.right = insertRec(root.right, profile);
            }
        }
        return root;
    }

    // Get profiles with rating higher than or equal to a minimum
    public List<TutorProfile> findHighlyRated(double minRating) {
        List<TutorProfile> result = new ArrayList<>();
        findHighlyRatedRec(root, minRating, result);
        return result;
    }

    private void findHighlyRatedRec(Node root, double minRating, List<TutorProfile> result) {
        if (root != null) {
            findHighlyRatedRec(root.left, minRating, result);

            double rating = root.profile.getAverageRating() != null ? root.profile.getAverageRating() : 0.0;
            if (rating >= minRating) {
                result.add(root.profile);
            }

            findHighlyRatedRec(root.right, minRating, result);
        }
    }

    // In-order traversal to get list sorted by rating
    public List<TutorProfile> getInOrderList() {
        List<TutorProfile> result = new ArrayList<>();
        inOrderRec(root, result);
        return result;
    }

    private void inOrderRec(Node root, List<TutorProfile> result) {
        if (root != null) {
            inOrderRec(root.left, result);
            result.add(root.profile);
            inOrderRec(root.right, result);
        }
    }
}
