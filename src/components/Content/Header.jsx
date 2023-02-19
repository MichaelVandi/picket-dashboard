import s from "../../styles/Header.module.css"

const Header = ({key, user}) => {

  return <header className={`${s.header} headerDiv centerRow`}>
    <div className="centerRow">
        <img src={process.env.PUBLIC_URL + '/img/logo.png'} alt="logo" className="logo-header" />
        <h1>Picket</h1>
    </div>
    <div className={`${s.userRow} centerRow user-header`}>
      <p className="username-header">{user.creator_name}</p>
      <div className="profile-parent-div">
        <img src={`${user.profile_image}`} alt="avatar" className="user-profile" />
      </div>
      
      <img src={process.env.PUBLIC_URL + "/img/dropDownArrow.svg"} alt="dropdown" className={s.dropDownArrow} />
    </div>
  </header >
}

const Search = () => {
  return <label className={`${s.search} search`}>
    <img src={process.env.PUBLIC_URL + "/img/search.svg"} alt="search icon" className={s.searchIcon} />
    <input type="text" placeholder="Search"></input>
  </label>
}

export default Header;