import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Array "mo:base/Array";

actor Game {
  type ScoreEntry = {
    player : Principal;
    wins : Nat;
    losses : Nat;
  };

  // Penyimpanan skor berdasarkan principal
  let scores = HashMap.HashMap<Principal, (Nat, Nat)>(10, Principal.equal, Principal.hash);

  // Simpan skor, caller dikirim dari frontend
  public func recordGame(caller: Principal, win : Bool) : async () {
    let current = scores.get(caller);

    let updated = switch current {
      case null {
        if (win) (1, 0) else (0, 1)
      };
      case (? (w, l)) {
        if (win) (w + 1, l) else (w, l + 1)
      }
    };

    scores.put(caller, updated);
  };

  // Ambil skor milik caller
  public query func getMyScore(caller: Principal) : async (Nat, Nat) {
    switch (scores.get(caller)) {
      case null (0, 0);
      case (? val) val;
    }
  };

  // Ambil semua skor
  public query func getAllScores() : async [ScoreEntry] {
    Array.map< (Principal, (Nat, Nat)), ScoreEntry>(
      Iter.toArray(scores.entries()),
      func ((p, (w, l))) : ScoreEntry = {
        player = p;
        wins = w;
        losses = l;
      }
    )
  };
};
